const prisma = require('../config/prisma');
const redis = require('../config/redis');
// Lazy-loaded to avoid circular dependency with rideTracking.js
const { notifyRideUpdate } = require('./notification');

function emitToDriverSafe(...args) {
  const { emitToDriver } = require('../sockets/rideTracking');
  return emitToDriver(...args);
}
function emitToRiderSafe(...args) {
  const { emitToRider } = require('../sockets/rideTracking');
  return emitToRider(...args);
}

const OFFER_TIMEOUT_MS = 15 * 1000; // 15 seconds per driver offer
const MAX_OFFER_ATTEMPTS = 5; // Try up to 5 drivers before giving up

// Haversine distance in km
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Score and rank available drivers near a pickup point
async function rankDrivers(pickupLat, pickupLng, maxRadiusKm = 10) {
  const onlineDrivers = await prisma.driverProfile.findMany({
    where: { isOnline: true, isOnRide: false, isApproved: true },
    include: { user: { select: { id: true, latitude: true, longitude: true, firstName: true, lastName: true, phone: true, avatarUrl: true } } },
  });

  // Filter by radius and get live positions from Redis
  const ranked = [];
  for (const dp of onlineDrivers) {
    let driverLat = dp.user.latitude;
    let driverLng = dp.user.longitude;

    // Prefer Redis-cached position (more recent)
    try {
      const cached = await redis.get(`driver:${dp.userId}:pos`);
      if (cached) {
        const pos = JSON.parse(cached);
        driverLat = pos.lat;
        driverLng = pos.lng;
      }
    } catch {}

    if (!driverLat || !driverLng) continue;

    const distanceKm = haversineKm(pickupLat, pickupLng, driverLat, driverLng);
    if (distanceKm > maxRadiusKm) continue;

    // Score: closer is better, higher rating is better, fewer rides is better (less busy)
    const distanceScore = 1 / (1 + distanceKm); // 0-1, closer = higher
    const ratingScore = dp.avgRating / 5; // 0-1
    const availabilityScore = 1 / (1 + dp.totalRides * 0.01); // slight preference for less busy
    const score = distanceScore * 0.6 + ratingScore * 0.25 + availabilityScore * 0.15;

    ranked.push({
      driverProfileId: dp.id,
      userId: dp.userId,
      firstName: dp.user.firstName,
      lastName: dp.user.lastName,
      phone: dp.user.phone,
      avatarUrl: dp.user.avatarUrl,
      vehicleType: dp.vehicleType,
      plateNumber: dp.plateNumber,
      distanceKm: Math.round(distanceKm * 10) / 10,
      score,
      lat: driverLat,
      lng: driverLng,
    });
  }

  // Sort by score descending (best driver first)
  ranked.sort((a, b) => b.score - a.score);
  return ranked;
}

// Offer a ride to drivers sequentially (Uber protocol)
async function dispatchRide(ride) {
  const candidates = await rankDrivers(ride.pickupLat, ride.pickupLng);

  if (candidates.length === 0) {
    // No drivers available — notify rider
    emitToRiderSafe(ride.riderId, 'ride:noDriversAvailable', { rideId: ride.id, message: 'No drivers available nearby. Please try again.' });
    return { dispatched: false, reason: 'no_drivers' };
  }

  // Store dispatch state in Redis for sequential offering
  const dispatchKey = `ride:${ride.id}:dispatch`;
  const driverQueue = candidates.slice(0, MAX_OFFER_ATTEMPTS).map((d) => d.userId);
  const currentIndex = 0;

  await redis.set(dispatchKey, JSON.stringify({ rideId: ride.id, driverQueue, currentIndex, startedAt: Date.now() }), 'EX', 300); // 5 min TTL

  // Offer to the first driver
  return offerToNextDriver(ride.id);
}

// Offer ride to the next driver in the queue
async function offerToNextDriver(rideId) {
  const dispatchKey = `ride:${rideId}:dispatch`;
  const raw = await redis.get(dispatchKey);
  if (!raw) return { dispatched: false, reason: 'dispatch_expired' };

  const state = JSON.parse(raw);
  if (state.currentIndex >= state.driverQueue.length) {
    // All drivers have been offered and declined/timed out
    emitToRiderSafe((await prisma.ride.findUnique({ where: { id: rideId } })).riderId, 'ride:noDriversAvailable', { rideId, message: 'No drivers accepted. Please try again.' });
    return { dispatched: false, reason: 'all_declined' };
  }

  const driverUserId = state.driverQueue[state.currentIndex];
  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    include: { rider: { select: { id: true, firstName: true, lastName: true, phone: true } } },
  });

  if (!ride || ride.status !== 'REQUESTED') {
    await redis.del(dispatchKey);
    return { dispatched: false, reason: 'ride_no_longer_available' };
  }

  // Emit offer to the specific driver
  emitToDriverSafe(driverUserId, 'ride:offered', {
    rideId: ride.id,
    rider: ride.rider,
    pickupLat: ride.pickupLat,
    pickupLng: ride.pickupLng,
    pickupLandmark: ride.pickupLandmark,
    dropoffLandmark: ride.dropoffLandmark,
    vehicleType: ride.vehicleType,
    fare: ride.fare,
    distance: ride.distance,
    surgeMultiplier: ride.surgeMultiplier,
  });

  // Set timeout for this driver's offer
  setTimeout(async () => {
    const current = await redis.get(dispatchKey);
    if (!current) return;
    const currentState = JSON.parse(current);
    // If still on the same driver index, they timed out — move to next
    if (currentState.currentIndex === state.currentIndex) {
      currentState.currentIndex += 1;
      await redis.set(dispatchKey, JSON.stringify(currentState), 'EX', 300);
      offerToNextDriver(rideId);
    }
  }, OFFER_TIMEOUT_MS);

  return { dispatched: true, driverUserId, currentIndex: state.currentIndex, totalCandidates: state.driverQueue.length };
}

// Driver accepts an offered ride
async function driverAcceptRide(rideId, driverUserId) {
  const dispatchKey = `ride:${rideId}:dispatch`;
  await redis.del(dispatchKey); // Clear dispatch state

  const dp = await prisma.driverProfile.findUnique({ where: { userId: driverUserId } });
  if (!dp || !dp.isApproved) return { error: 'Driver not approved' };

  const lockKey = `ride:${rideId}:lock`;
  const lockAcquired = await redis.set(lockKey, '1', 'NX', 'EX', 5);
  if (!lockAcquired) return { error: 'Ride is being processed' };

  const updated = await prisma.ride.updateMany({
    where: { id: rideId, status: 'REQUESTED' },
    data: { driverId: dp.id, status: 'DRIVER_ASSIGNED' },
  });
  if (updated.count === 0) {
    await redis.del(lockKey);
    return { error: 'Ride already accepted or unavailable' };
  }

  const ride = await prisma.ride.findUnique({
    where: { id: rideId },
    include: { rider: { select: { id: true, firstName: true, lastName: true, phone: true } }, driver: { include: { user: { select: { id: true, firstName: true, lastName: true, phone: true, avatarUrl: true } } } } },
  });

  await prisma.driverProfile.update({ where: { id: dp.id }, data: { isOnRide: true } });
  emitToRiderSafe(ride.riderId, 'ride:accepted', ride);
  await notifyRideUpdate(ride.riderId, ride.id, 'DRIVER_ASSIGNED');
  await redis.del(lockKey);

  return { ride, driver: dp };
}

// Driver declines an offered ride — move to next driver
async function driverDeclineRide(rideId, driverUserId) {
  const dispatchKey = `ride:${rideId}:dispatch`;
  const raw = await redis.get(dispatchKey);
  if (!raw) return { error: 'Offer expired' };

  const state = JSON.parse(raw);
  // Advance to next driver
  state.currentIndex += 1;
  await redis.set(dispatchKey, JSON.stringify(state), 'EX', 300);

  return offerToNextDriver(rideId);
}

module.exports = { rankDrivers, dispatchRide, offerToNextDriver, driverAcceptRide, driverDeclineRide, OFFER_TIMEOUT_MS, MAX_OFFER_ATTEMPTS };
