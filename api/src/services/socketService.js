// ============================================================
// Socket.io Real-Time Service — EazyRide + Haye! v3.0.0
// ============================================================

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const { cache } = require('../config/redis');
const { SOCKET_EVENTS, DRIVER_LOCATION_TTL } = require('../config/constants');
const logger = require('../utils/logger');

let io = null;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST']
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          driverProfile: true
        }
      });

      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    const user = socket.user;
    logger.info(`Socket connected: ${user.firstName} ${user.lastName} (${user.role})`);

    // Join user's personal room
    socket.join(`user:${user.id}`);

    // Join role-based room
    socket.join(`role:${user.role}`);

    // If driver, join driver-specific room
    if (user.role === 'DRIVER' && user.driverProfile) {
      socket.join('drivers');
      if (user.driverProfile.isOnline) {
        socket.join('drivers:online');
      }
    }

    // ========================================
    // DRIVER LOCATION TRACKING
    // ========================================
    
    socket.on(SOCKET_EVENTS.DRIVER_LOCATION, async (data) => {
      try {
        const { lat, lng, heading } = data;
        
        // Store in Redis with TTL
        await cache.set(`driver:${user.id}:location`, {
          lat,
          lng,
          heading,
          timestamp: Date.now()
        }, DRIVER_LOCATION_TTL);

        // Broadcast to riders tracking this driver
        socket.to(`tracking:${user.id}`).emit(SOCKET_EVENTS.DRIVER_LOCATION, {
          driverId: user.id,
          lat,
          lng,
          heading,
          timestamp: Date.now()
        });

      } catch (error) {
        logger.error('Error handling driver location:', error);
      }
    });

    // ========================================
    // RIDE EVENTS
    // ========================================

    // Driver goes online
    socket.on('driver:online', async () => {
      if (user.role === 'DRIVER') {
        await prisma.driverProfile.update({
          where: { userId: user.id },
          data: { isOnline: true }
        });
        socket.join('drivers:online');
        io.emit('driver:online', { driverId: user.id });
        logger.info(`Driver online: ${user.id}`);
      }
    });

    // Driver goes offline
    socket.on('driver:offline', async () => {
      if (user.role === 'DRIVER') {
        await prisma.driverProfile.update({
          where: { userId: user.id },
          data: { isOnline: false }
        });
        socket.leave('drivers:online');
        io.emit('driver:offline', { driverId: user.id });
        logger.info(`Driver offline: ${user.id}`);
      }
    });

    // Ride request broadcast
    socket.on(SOCKET_EVENTS.RIDE_REQUEST, (data) => {
      socket.to('drivers:online').emit(SOCKET_EVENTS.RIDE_REQUEST, {
        ...data,
        riderId: user.id
      });
    });

    // Ride offer from driver
    socket.on(SOCKET_EVENTS.RIDE_OFFER, (data) => {
      io.to(`user:${data.riderId}`).emit(SOCKET_EVENTS.RIDE_OFFER, {
        ...data,
        driverId: user.id,
        driverName: `${user.firstName} ${user.lastName}`
      });
    });

    // Ride update
    socket.on(SOCKET_EVENTS.RIDE_UPDATE, (data) => {
      const { rideId, status, targetUserId, targetDriverId } = data;
      
      if (targetUserId) {
        io.to(`user:${targetUserId}`).emit(SOCKET_EVENTS.RIDE_UPDATE, {
          rideId,
          status,
          ...data
        });
      }
      if (targetDriverId) {
        io.to(`user:${targetDriverId}`).emit(SOCKET_EVENTS.RIDE_UPDATE, {
          rideId,
          status,
          ...data
        });
      }
    });

    // Track driver (rider subscribes to driver updates)
    socket.on('track:driver', (data) => {
      socket.join(`tracking:${data.driverId}`);
    });

    // Stop tracking driver
    socket.on('untrack:driver', (data) => {
      socket.leave(`tracking:${data.driverId}`);
    });

    // ========================================
    // ORDER EVENTS
    // ========================================

    socket.on(SOCKET_EVENTS.ORDER_UPDATE, (data) => {
      const { orderId, storeId, riderId, driverId } = data;
      
      // Notify store
      if (storeId) {
        io.to(`store:${storeId}`).emit(SOCKET_EVENTS.ORDER_UPDATE, data);
      }
      // Notify rider
      if (riderId) {
        io.to(`user:${riderId}`).emit(SOCKET_EVENTS.ORDER_UPDATE, data);
      }
      // Notify driver
      if (driverId) {
        io.to(`user:${driverId}`).emit(SOCKET_EVENTS.ORDER_UPDATE, data);
      }
    });

    // ========================================
    // CHAT EVENTS
    // ========================================

    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, async (data) => {
      try {
        const { receiverId, message, rideId, orderId } = data;
        
        // Save message to database
        const chat = await prisma.chat.create({
          data: {
            senderId: user.id,
            receiverId,
            message,
            rideId,
            orderId
          },
          include: {
            sender: {
              select: { id: true, firstName: true, lastName: true }
            }
          }
        });

        // Send to receiver
        io.to(`user:${receiverId}`).emit(SOCKET_EVENTS.CHAT_MESSAGE, chat);
        
        // Send back to sender for confirmation
        socket.emit(SOCKET_EVENTS.CHAT_MESSAGE, chat);
        
      } catch (error) {
        logger.error('Error handling chat message:', error);
      }
    });

    // ========================================
    // SOS ALERTS
    // ========================================

    socket.on(SOCKET_EVENTS.SOS_ALERT, async (data) => {
      try {
        const { location, address, message, rideId, orderId } = data;
        
        // Save SOS alert
        const alert = await prisma.sOSAlert.create({
          data: {
            userId: user.id,
            rideId,
            orderId,
            location,
            address,
            message,
            status: 'ACTIVE'
          }
        });

        // Notify all admins
        io.to('role:ADMIN').emit(SOCKET_EVENTS.SOS_ALERT, {
          ...alert,
          user: {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            phone: user.phone || 'Unknown'
          }
        });

        logger.warn(`SOS Alert from user ${user.id}`);
        
      } catch (error) {
        logger.error('Error handling SOS alert:', error);
      }
    });

    // ========================================
    // RESERVATION EVENTS
    // ========================================

    socket.on(SOCKET_EVENTS.RESERVATION_UPDATE, (data) => {
      const { bookingId, providerId, riderId } = data;
      
      // Notify provider
      if (providerId) {
        io.to(`provider:${providerId}`).emit(SOCKET_EVENTS.RESERVATION_UPDATE, data);
      }
      // Notify rider
      if (riderId) {
        io.to(`user:${riderId}`).emit(SOCKET_EVENTS.RESERVATION_UPDATE, data);
      }
    });

    // ========================================
    // NOTIFICATION EVENTS
    // ========================================

    socket.on(SOCKET_EVENTS.NOTIFICATION, (data) => {
      const { targetUserId } = data;
      if (targetUserId) {
        io.to(`user:${targetUserId}`).emit(SOCKET_EVENTS.NOTIFICATION, data);
      }
    });

    // ========================================
    // ADMIN ROOMS
    // ========================================

    if (user.role === 'ADMIN') {
      socket.join('admins');
    }

    // ========================================
    // DISCONNECT
    // ========================================

    socket.on('disconnect', async () => {
      logger.info(`Socket disconnected: ${user.firstName} ${user.lastName}`);
      
      // If driver, mark offline
      if (user.role === 'DRIVER') {
        await prisma.driverProfile.update({
          where: { userId: user.id },
          data: { isOnline: false }
        }).catch(() => {});
      }
    });
  });

  logger.info('✅ Socket.io initialized');
  return io;
};

// Get io instance
const getIO = () => io;

// Emit to specific user
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

// Emit to all admins
const emitToAdmins = (event, data) => {
  if (io) {
    io.to('admins').emit(event, data);
  }
};

// Emit to all drivers
const emitToDrivers = (event, data) => {
  if (io) {
    io.to('drivers').emit(event, data);
  }
};

// Emit to online drivers
const emitToOnlineDrivers = (event, data) => {
  if (io) {
    io.to('drivers:online').emit(event, data);
  }
};

module.exports = {
  initializeSocket,
  getIO,
  emitToUser,
  emitToAdmins,
  emitToDrivers,
  emitToOnlineDrivers
};
