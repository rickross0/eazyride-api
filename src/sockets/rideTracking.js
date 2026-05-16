const jwt = require('jsonwebtoken');
const redis = require('../config/redis');
const prisma = require('../config/prisma');
const dispatchService = require('../services/dispatchService');
const { notifyRideUpdate, notifyDriverRideOffered } = require('../services/notification');

const JWT_SECRET = process.env.JWT_SECRET;
const DRIVER_POS_TTL = 30;
const NEARBY_RADIUS_KM = 5;

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const socketUserMap = new Map();
const userSocketMap = new Map();
let ioInstance = null;

function setupRideSocket(io) {
  ioInstance = io;

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch {
      return next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`[Socket] Connected: ${socket.id} user: ${userId}`);

    socketUserMap.set(socket.id, userId);
    userSocketMap.set(userId, socket.id);

    socket.join(`user:${userId}`);
    if (socket.userRole === 'DRIVER') {
      socket.join(`driver:${userId}`);
      socket.join('drivers');
    }

    // --- Driver goes online ---
    socket.on('driver:goOnline', async ({ lat, lng }) => {
      try {
        const region = `${lat.toFixed(1)}_${lng.toFixed(1)}`;
        socket.join(`region:${region}`);
        socket.driverRegion = region;

        await redis.set(`driver:${userId}:pos`, JSON.stringify({ lat, lng }), 'EX', DRIVER_POS_TTL);
        await redis.set(`driver:${userId}:online`, '1', 'EX', 86400);

        await prisma.driverProfile.update({
          where: { userId },
          data: { isOnline: true, latitude: lat, longitude: lng },
        });

        await prisma.user.update({
          where: { id: userId },
          data: { latitude: lat, longitude: lng },
        });

        console.log(`[Socket] Driver ${userId} online in region ${region}`);
      } catch (err) {
        console.error('[Socket] driver:goOnline error:', err);
      }
    });

    // --- Driver goes offline ---
    socket.on('driver:goOffline', async () => {
      try {
        if (socket.driverRegion) {
          socket.leave(`region:${socket.driverRegion}`);
        }
        await redis.del(`driver:${userId}:pos`, `driver:${userId}:online`);
        await prisma.driverProfile.update({
          where: { userId },
          data: { isOnline: false },
        });
        console.log(`[Socket] Driver ${userId} offline`);
      } catch (err) {
        console.error('[Socket] driver:goOffline error:', err);
      }
    });

    // --- Driver broadcasts GPS position ---
    socket.on('driver:location', async ({ lat, lng }) => {
      try {
        await redis.set(`driver:${userId}:pos`, JSON.stringify({ lat, lng }), 'EX', DRIVER_POS_TTL);

        const newRegion = `${lat.toFixed(1)}_${lng.toFixed(1)}`;
        if (socket.driverRegion && socket.driverRegion !== newRegion) {
          socket.leave(`region:${socket.driverRegion}`);
          socket.join(`region:${newRegion}`);
          socket.driverRegion = newRegion;
        }

        await prisma.user.update({
          where: { id: userId },
          data: { latitude: lat, longitude: lng },
        });

        const driverProfile = await prisma.driverProfile.findUnique({
          where: { userId },
        });

        if (driverProfile) {
          const activeRides = await prisma.ride.findMany({
            where: {
              driverId: driverProfile.id,
              status: { in: ['DRIVER_ASSIGNED', 'DRIVER_ARRIVING', 'IN_PROGRESS'] },
            },
            select: { id: true, riderId: true },
          });

          for (const ride of activeRides) {
            io.to(`ride:${ride.id}`).emit('driver:location', { lat, lng });
          }
        }
      } catch (err) {
        console.error('[Socket] driver:location error:', err);
      }
    });

    // --- Rider subscribes to a ride room for live tracking ---
    socket.on('ride:track', ({ rideId }) => {
      if (!rideId) return;
      socket.join(`ride:${rideId}`);
    });

    // --- In-ride chat between driver and rider ---
    socket.on('chat:message', (msg) => {
      if (!msg.rideId || !msg.text) return;
      const outgoing = { ...msg, timestamp: msg.timestamp || new Date().toISOString() };
      io.to(`ride:${msg.rideId}`).emit('chat:message', outgoing);
    });

    // --- Driver accepts a ride offer (via socket — also available as REST) ---
    socket.on('ride:accept', async ({ rideId }) => {
      try {
        const result = await dispatchService.driverAcceptRide(rideId, userId);
        if (result.error) {
          socket.emit('ride:acceptError', { rideId, error: result.error });
        } else {
          socket.emit('ride:accepted', { rideId, ride: result.ride });
        }
      } catch (err) {
        console.error('[Socket] ride:accept error:', err);
        socket.emit('ride:acceptError', { rideId, error: err.message });
      }
    });

    // --- Driver declines a ride offer (via socket — also available as REST) ---
    socket.on('ride:decline', async ({ rideId }) => {
      try {
        const result = await dispatchService.driverDeclineRide(rideId, userId);
        socket.emit('ride:declined', { rideId });
      } catch (err) {
        console.error('[Socket] ride:decline error:', err);
        socket.emit('ride:declineError', { rideId, error: err.message });
      }
    });

    // --- Disconnect ---
    socket.on('disconnect', async () => {
      const uid = socketUserMap.get(socket.id);
      if (uid) {
        userSocketMap.delete(uid);
        if (socket.userRole === 'DRIVER') {
          await redis.del(`driver:${uid}:pos`, `driver:${uid}:online`);
          await prisma.driverProfile.update({
            where: { userId: uid },
            data: { isOnline: false },
          }).catch(() => {});
        }
      }
      socketUserMap.delete(socket.id);
      console.log(`[Socket] Disconnected: ${socket.id} (user: ${uid || 'unknown'})`);
    });
  });
}

function emitToUser(userId, event, data) {
  if (ioInstance) ioInstance.to(`user:${userId}`).emit(event, data);
}

function emitToDriver(driverId, event, data) {
  if (ioInstance) ioInstance.to(`driver:${driverId}`).emit(event, data);
}

function emitToRider(riderId, event, data) {
  if (ioInstance) ioInstance.to(`user:${riderId}`).emit(event, data);
}

function emitToRide(rideId, event, data) {
  if (ioInstance) ioInstance.to(`ride:${rideId}`).emit(event, data);
}

function emitToAllDrivers(event, data) {
  if (ioInstance) ioInstance.to('drivers').emit(event, data);
}

function emitToRegion(region, event, data) {
  if (ioInstance) ioInstance.to(`region:${region}`).emit(event, data);
}

module.exports = {
  setupRideSocket,
  emitToUser,
  emitToDriver,
  emitToRider,
  emitToRide,
  emitToAllDrivers,
  emitToRegion,
  haversineKm,
};
