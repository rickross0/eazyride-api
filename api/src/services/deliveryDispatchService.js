const prisma = require('../config/prisma');
const redis = require('../config/redis');
// Lazy-loaded to avoid circular dependency
const { notifyOrderUpdate, sendPush } = require('./notification');

function emitToDriverSafe(...args) {
  const { emitToDriver } = require('../sockets/rideTracking');
  return emitToDriverSafe(...args);
}
function emitToUserSafe(...args) {
  const { emitToUser } = require('../sockets/rideTracking');
  return emitToUserSafe(...args);
}

const DELIVERY_RADIUS_KM = 5;

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function generatePickupPin() {
  return String(Math.floor(1000 + Math.random() * 9000)); // 4-digit PIN
}

// Assign the nearest available delivery driver to a food order
async function assignDriver(orderId) {
  const order = await prisma.foodOrder.findUnique({
    where: { id: orderId },
    include: { restaurant: { select: { id: true, name: true, latitude: true, longitude: true } } },
  });

  if (!order || !order.restaurant) throw new Error('Order or restaurant not found');
  if (order.status !== 'CONFIRMED' && order.status !== 'PREPARING' && order.status !== 'READY') {
    throw new Error('Order must be confirmed/preparing/ready to assign driver');
  }

  const restLat = order.restaurant.latitude;
  const restLng = order.restaurant.longitude;

  // Find online delivery drivers near the restaurant
  const deliveryDrivers = await prisma.driverProfile.findMany({
    where: { isOnline: true, isOnRide: false, isApproved: true, canDeliver: true },
    include: { user: { select: { id: true, latitude: true, longitude: true, firstName: true, phone: true, fcmToken: true } } },
  });

  let bestDriver = null;
  let bestDist = Infinity;

  for (const dp of deliveryDrivers) {
    let driverLat = dp.user.latitude;
    let driverLng = dp.user.longitude;

    // Check Redis for more recent position
    try {
      const cached = await redis.get(`driver:${dp.userId}:pos`);
      if (cached) {
        const pos = JSON.parse(cached);
        driverLat = pos.lat;
        driverLng = pos.lng;
      }
    } catch {}

    if (!driverLat || !driverLng) continue;

    const dist = haversineKm(restLat, restLng, driverLat, driverLng);
    if (dist <= DELIVERY_RADIUS_KM && dist < bestDist) {
      bestDist = dist;
      bestDriver = { profile: dp, user: dp.user, distanceKm: dist };
    }
  }

  if (!bestDriver) {
    // No delivery drivers available
    console.log(`[DeliveryDispatch] No delivery drivers available for order ${orderId}`);
    return { assigned: false, reason: 'no_drivers' };
  }

  const pickupPin = generatePickupPin();

  // Assign driver and set pickup PIN
  const updated = await prisma.foodOrder.update({
    where: { id: orderId },
    data: {
      driverId: bestDriver.profile.id,
      pickupPin,
      status: 'DRIVER_ASSIGNED',
    },
  });

  // Notify driver via socket
  emitToDriverSafe(bestDriver.user.id, 'delivery:assigned', {
    orderId,
    restaurantName: order.restaurant.name,
    restaurantLat: restLat,
    restaurantLng: restLng,
    pickupPin,
    orderNumber: orderId.slice(0, 8),
  });

  // Push notification
  await sendPush(bestDriver.user.id, 'New Delivery Assignment', `Pickup from ${order.restaurant.name}`, { type: 'DELIVERY_ASSIGNMENT', orderId });

  // Notify customer
  await notifyOrderUpdate(order.userId, orderId, 'DRIVER_ASSIGNED');

  return { assigned: true, driverId: bestDriver.profile.id, pickupPin, distanceKm: bestDist };
}

// GPS verification: check if driver is near the restaurant
async function verifyDriverArrival(orderId, driverUserId, nfcVerified = false) {
  const order = await prisma.foodOrder.findUnique({
    where: { id: orderId },
    include: { restaurant: { select: { latitude: true, longitude: true, name: true } } },
  });

  if (!order) throw new Error('Order not found');
  if (order.status !== 'DRIVER_ASSIGNED') throw new Error('Order must be DRIVER_ASSIGNED to verify arrival');

  // Get driver's current position from Redis
  let driverPos = null;
  try {
    const cached = await redis.get(`driver:${driverUserId}:pos`);
    if (cached) driverPos = JSON.parse(cached);
  } catch {}

  // NFC override: skip GPS check if NFC verified (physical proximity of ~4cm)
  if (nfcVerified) {
    const updated = await prisma.foodOrder.update({
      where: { id: orderId },
      data: { status: 'DRIVER_ARRIVED' },
    });

    const storeOwner = await prisma.user.findUnique({ where: { id: order.restaurant.ownerId || order.userId } });
    if (storeOwner) {
      await sendPush(storeOwner.id, 'Driver Arrived (NFC)', `Driver verified via NFC at ${order.restaurant.name} for order #${orderId.slice(0, 8)}`, { type: 'DRIVER_ARRIVED', orderId });
    }

    await notifyOrderUpdate(order.userId, orderId, 'DRIVER_ARRIVED');

    return { arrived: true, distanceKm: 0, method: 'NFC' };
  }

  if (!driverPos) throw new Error('Driver position not available');

  const dist = haversineKm(driverPos.lat, driverPos.lng, order.restaurant.latitude, order.restaurant.longitude);
  const arrivalRadiusKm = 0.1; // 100 meters

  if (dist > arrivalRadiusKm) {
    return { arrived: false, distanceKm: Math.round(dist * 1000), message: `Driver is ${Math.round(dist * 1000)}m away, must be within 100m` };
  }

  const updated = await prisma.foodOrder.update({
    where: { id: orderId },
    data: { status: 'DRIVER_ARRIVED' },
  });

  // Notify store owner
  const storeOwner = await prisma.user.findUnique({ where: { id: order.restaurant.ownerId || order.userId } });
  if (storeOwner) {
    await sendPush(storeOwner.id, 'Driver Arrived', `Driver is at ${order.restaurant.name} for order #${orderId.slice(0, 8)}`, { type: 'DRIVER_ARRIVED', orderId });
  }

  // Notify customer
  await notifyOrderUpdate(order.userId, orderId, 'DRIVER_ARRIVED');

  return { arrived: true, distanceKm: Math.round(dist * 1000) };
}

// NFC override: if nfcVerified=true, driver can confirm arrival even if GPS distance is too far
// (NFC requires physical proximity of ~4cm, which is stronger proof than 100m GPS)

module.exports = { assignDriver, verifyDriverArrival, generatePickupPin };
