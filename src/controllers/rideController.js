// ============================================================
// Ride Controller — v3.0.0
// ============================================================

const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { paginate, paginationResponse, flattenRide } = require('../utils/helpers');
const { calculateFare } = require('../services/fareService');
const { getRoute, reverseGeocode } = require('../services/geoService');
const { emitToUser, emitToOnlineDrivers } = require('../services/socketService');
const logger = require('../utils/logger');

// Flatten ride for frontend compatibility
const flattenRide = (ride) => {
  if (!ride) return ride;
  const flat = { ...ride };
  if (ride.pickupCoordinates) {
    flat.pickupLat = ride.pickupCoordinates.lat;
    flat.pickupLng = ride.pickupCoordinates.lng;
  }
  if (ride.dropoffCoordinates) {
    flat.dropoffLat = ride.dropoffCoordinates.lat;
    flat.dropoffLng = ride.dropoffCoordinates.lng;
  }
  flat.fare = ride.totalFare || ride.fare || 0;
  flat.total = ride.totalFare || ride.total || 0;
  flat.distance = ride.estimatedDistance || 0;
  flat.vehicleType = ride.vehicleType || 'BAJAJ';
  return flat;
};

exports.createRide = async (req, res, next) => {
  try {
    const riderId = req.user.id;
    console.log('[createRide] BODY:', JSON.stringify(req.body));
    let {
      pickupAddress, dropoffAddress,
      pickupCoordinates, dropoffCoordinates,
      pickupLat, pickupLng, dropoffLat, dropoffLng,
      vehicleType = 'BAJAJ', paymentMethod = 'EVC_PLUS', promoCode,
    } = req.body;

    // Support both frontend formats: flat lat/lng OR nested coordinates
    const pickup = pickupCoordinates || (pickupLat != null && pickupLng != null ? { lat: Number(pickupLat), lng: Number(pickupLng) } : null);
    const dropoff = dropoffCoordinates || (dropoffLat != null && dropoffLng != null ? { lat: Number(dropoffLat), lng: Number(dropoffLng) } : null);
    console.log('[createRide] pickup:', pickup, 'dropoff:', dropoff);

    if (!pickup) throw new AppError('Pickup location required (pickupLat/pickupLng or pickupCoordinates)', 400);

    // Default dropoff to nearby if not provided (quick-ride flow)
    const effectiveDropoff = dropoff || { lat: pickup.lat + 0.005, lng: pickup.lng + 0.005 };

    // Reverse-geocode addresses if not provided
    if (!pickupAddress) {
      try {
        const geo = await reverseGeocode(pickup.lat, pickup.lng);
        pickupAddress = geo.address || 'Pickup location';
      } catch { pickupAddress = 'Pickup location'; }
    }
    if (!dropoffAddress && dropoff) {
      try {
        const geo = await reverseGeocode(dropoff.lat, dropoff.lng);
        dropoffAddress = geo.address || 'Dropoff location';
      } catch { dropoffAddress = 'Dropoff location'; }
    }
    if (!dropoffAddress) dropoffAddress = 'Nearby dropoff';

    const route = await getRoute(pickup, effectiveDropoff);
    const fare = await calculateFare({ distance: route.distance, duration: route.duration, vehicleType, promoCode });

    const ride = await prisma.ride.create({
      data: {
        riderId,
        pickupAddress,
        dropoffAddress,
        pickupCoordinates: pickup,
        dropoffCoordinates: effectiveDropoff,
        estimatedDistance: route.distance,
        estimatedDuration: Math.round(route.duration),
        vehicleType,
        paymentMethod,
        baseFare: fare.baseFare,
        distanceFare: fare.distanceFare,
        timeFare: fare.timeFare,
        surgeFare: fare.surgeFare,
        totalFare: fare.totalFare,
        discountAmount: fare.discountAmount,
        commissionAmount: fare.commissionAmount,
        driverEarnings: fare.driverEarnings,
      },
    });

    const flatRide = flattenRide(ride);
    emitToOnlineDrivers('ride:request', { rideId: ride.id, pickup: pickupAddress, dropoff: dropoffAddress, fare: fare.totalFare, vehicleType });
    logger.info(`Ride created: ${ride.id}`);
    res.status(201).json({ success: true, data: flatRide, ride: flatRide });
  } catch (error) { next(error); }
};

exports.getRideById = async (req, res, next) => {
  try {
    const ride = await prisma.ride.findUnique({
      where: { id: req.params.id },
      include: {
        rider: { select: { id: true, firstName: true, lastName: true, phone: true, avatar: true } },
        driver: { select: { id: true, firstName: true, lastName: true, phone: true, avatar: true, driverProfile: true } },
        offers: true,
      },
    });
    if (!ride) throw new AppError('Ride not found', 404);
    const flatRide = flattenRide(ride);
    res.json({ success: true, data: flatRide, ride: flatRide, driver: ride.driver, location: null });
  } catch (error) { next(error); }
};

exports.acceptRide = async (req, res, next) => {
  try {
    const ride = await prisma.ride.update({
      where: { id: req.params.id },
      data: { driverId: req.user.id, status: 'ACCEPTED' },
    });
    emitToUser(ride.riderId, 'ride:update', { rideId: ride.id, status: 'ACCEPTED', driverId: req.user.id });
    res.json({ success: true, data: flattenRide(ride) });
  } catch (error) { next(error); }
};

exports.updateRideStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const ride = await prisma.ride.findUnique({ where: { id: req.params.id } });
    if (!ride) throw new AppError('Ride not found', 404);

    const updateData = { status };
    if (status === 'DRIVER_ARRIVED') updateData.startedAt = new Date();
    if (status === 'IN_PROGRESS') updateData.startedAt = updateData.startedAt || new Date();
    if (status === 'COMPLETED') { updateData.completedAt = new Date(); updateData.finalFare = ride.totalFare; }
    if (status === 'CANCELLED') { updateData.cancelledAt = new Date(); updateData.cancelledBy = req.user.id; }

    const updated = await prisma.ride.update({ where: { id: req.params.id }, data: updateData });
    emitToUser(updated.riderId, 'ride:update', { rideId: updated.id, status });
    if (updated.driverId) emitToUser(updated.driverId, 'ride:update', { rideId: updated.id, status });
    res.json({ success: true, data: flattenRide(updated) });
  } catch (error) { next(error); }
};

exports.rateRide = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const ride = await prisma.ride.update({
      where: { id: req.params.id },
      data: { rating, ratingComment: comment },
    });
    if (ride.driverId && rating) {
      const driverRides = await prisma.ride.findMany({ where: { driverId: ride.driverId, rating: { not: null } }, select: { rating: true } });
      const avgRating = driverRides.reduce((s, r) => s + r.rating, 0) / driverRides.length;
      await prisma.driverProfile.update({ where: { userId: ride.driverId }, data: { rating: avgRating } });
    }
    res.json({ success: true, message: 'Ride rated' });
  } catch (error) { next(error); }
};

exports.createRideOffer = async (req, res, next) => {
  try {
    const { offeredFare } = req.body;
    const offer = await prisma.rideOffer.create({
      data: { rideId: req.params.id, driverId: req.user.id, offeredFare, expiresAt: new Date(Date.now() + 60000) },
    });
    const ride = await prisma.ride.findUnique({ where: { id: req.params.id } });
    if (ride) emitToUser(ride.riderId, 'ride:offer', { offerId: offer.id, offeredFare, driverId: req.user.id });
    res.status(201).json({ success: true, data: offer });
  } catch (error) { next(error); }
};

exports.cancelRide = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const ride = await prisma.ride.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: reason, cancelledBy: req.user.id },
    });
    if (ride.driverId) emitToUser(ride.driverId, 'ride:update', { rideId: ride.id, status: 'CANCELLED' });
    emitToUser(ride.riderId, 'ride:update', { rideId: ride.id, status: 'CANCELLED' });
    res.json({ success: true, data: flattenRide(ride) });
  } catch (error) { next(error); }
};

exports.getAllRides = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const { skip, take, page: p, limit: l } = paginate(page, limit);
    const where = {};
    if (status) where.status = status;
    const [rides, total] = await Promise.all([
      prisma.ride.findMany({ where, skip, take: l, orderBy: { createdAt: 'desc' }, include: { rider: { select: { firstName: true, lastName: true, phone: true } }, driver: { select: { firstName: true, lastName: true, phone: true, driverProfile: true } } } }),
      prisma.ride.count({ where }),
    ]);
    res.json({ success: true, ...paginationResponse(rides.map(flattenRide), total, p, l) });
  } catch (error) { next(error); }
};

