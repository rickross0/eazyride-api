const prisma = require('../config/prisma');
const redis = require('../config/redis');
const { notifyOrderUpdate, sendPush } = require('./notification');

function emitToDriverSafe(...args) {
  try {
    const { emitToDriver } = require('../sockets/rideTracking');
    return emitToDriver(...args);
  } catch {}
}
function emitToUserSafe(...args) {
  try {
    const { emitToUser } = require('../sockets/rideTracking');
    return emitToUser(...args);
  } catch {}
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
  return String(Math.floor(1000 + Math.random() * 9000));
}

async function assignDriver(orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { store: { select: { id: true, name: true, latitude: true, longitude: true } } },
  });

  if (!order || !order.store) throw new Error('Order or store not found');
  if (order.status !== 'CONFIRMED' && order.status !== 'PREPARING' && order.status !== 'READY') {
    throw new Error('Order must be confirmed/preparing/ready to assign driver');
  }

  const restLat = order.store.latitude;
  const restLng = order.store.longitude;

  const deliveryDrivers = await prisma.driverProfile.findMany({
    where: { isOnline: true, isOnRide: false, status: 'APPROVED', canDeliver: true },
    include: { user: { select: { id: true, latitude: true, longitude: true, firstName: true, phone: true, fcmToken: true } } },
  });

  let bestDriver = null;
  let bestDist = Infinity;

  for (const dp of deliveryDrivers) {
    let driverLat = dp.user.latitude;
    let driverLng = dp.user.longitude;

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
    console.log(`[DeliveryDispatch] No delivery drivers available for order ${orderId}`);
    return { assigned: false, reason: 'no_drivers' };
  }

  const pickupPin = generatePickupPin();

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      driverId: bestDriver.user.id,
      pickupPin,
      status: 'DRIVER_ASSIGNED',
    },
  });

  emitToDriverSafe(bestDriver.user.id, 'delivery:assigned', {
    orderId,
    restaurantName: order.store.name,
    restaurantLat: restLat,
    restaurantLng: restLng,
    pickupPin,
    orderNumber: orderId.slice(0, 8),
  });

  await sendPush(bestDriver.user.id, 'New Delivery Assignment', `Pickup from ${order.store.name}`, { type: 'DELIVERY_ASSIGNMENT', orderId });
  await notifyOrderUpdate(order.riderId, orderId, 'DRIVER_ASSIGNED');

  return { assigned: true, driverId: bestDriver.user.id, pickupPin, distanceKm: bestDist };
}

async function verifyDriverArrival(orderId, driverUserId, nfcVerified = false) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { store: { select: { latitude: true, longitude: true, name: true, ownerId: true } } },
  });

  if (!order) throw new Error('Order not found');
  if (order.status !== 'DRIVER_ASSIGNED') throw new Error('Order must be DRIVER_ASSIGNED to verify arrival');

  let driverPos = null;
  try {
    const cached = await redis.get(`driver:${driverUserId}:pos`);
    if (cached) driverPos = JSON.parse(cached);
  } catch {}

  if (nfcVerified) {
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'DRIVER_ARRIVED' },
    });

    const storeOwner = await prisma.user.findUnique({ where: { id: order.store.ownerId || order.riderId } });
    if (storeOwner) {
      await sendPush(storeOwner.id, 'Driver Arrived (NFC)', `Driver verified via NFC at ${order.store.name} for order #${orderId.slice(0, 8)}`, { type: 'DRIVER_ARRIVED', orderId });
    }

    await notifyOrderUpdate(order.riderId, orderId, 'DRIVER_ARRIVED');

    return { arrived: true, distanceKm: 0, method: 'NFC' };
  }

  if (!driverPos) throw new Error('Driver position not available');

  const dist = haversineKm(driverPos.lat, driverPos.lng, order.store.latitude, order.store.longitude);
  const arrivalRadiusKm = 0.1;

  if (dist > arrivalRadiusKm) {
    return { arrived: false, distanceKm: Math.round(dist * 1000), message: `Driver is ${Math.round(dist * 1000)}m away, must be within 100m` };
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status: 'DRIVER_ARRIVED' },
  });

  const storeOwner = await prisma.user.findUnique({ where: { id: order.store.ownerId || order.riderId } });
  if (storeOwner) {
    await sendPush(storeOwner.id, 'Driver Arrived', `Driver is at ${order.store.name} for order #${orderId.slice(0, 8)}`, { type: 'DRIVER_ARRIVED', orderId });
  }

  await notifyOrderUpdate(order.riderId, orderId, 'DRIVER_ARRIVED');

  return { arrived: true, distanceKm: Math.round(dist * 1000) };
}

module.exports = { assignDriver, verifyDriverArrival, generatePickupPin };
