const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { authMiddleware, attachUser, roleMiddleware, adminMinLevel } = require('../middleware/auth');

// Rider/driver triggers SOS
router.post('/', authMiddleware, attachUser, async (req, res) => {
  try {
    const { rideId, latitude, longitude, address, message } = req.body;
    let driverId = null;
    
    // If rideId provided, find the driver
    if (rideId) {
      try {
        const ride = await prisma.ride.findUnique({ where: { id: rideId }, select: { driverId: true } });
        if (ride?.driverId) {
          const dp = await prisma.driverProfile.findUnique({ where: { id: ride.driverId }, include: { user: { select: { id: true, firstName: true, lastName: true, phone: true } } } });
          driverId = dp?.user?.id || null;
        }
      } catch (e) {}
    }
    
    const alert = await prisma.sosAlert.create({
      data: {
        userId: req.user.id,
        rideId: rideId || null,
        driverId,
        latitude: latitude || null,
        longitude: longitude || null,
        address: address || null,
        message: message || 'SOS Emergency',
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, phone: true, avatarUrl: true } },
      },
    });

    // Emit real-time alert to all admins
    try {
      const { emitToRole } = require('../sockets/rideTracking');
      emitToRole('ADMIN', 'sos:alert', alert);
    } catch (e) { console.log('[SOS] Socket emit skipped:', e.message); }

    return res.status(201).json({ alert });
  } catch (err) {
    console.error('SOS create error:', err);
    return res.status(500).json({ error: 'Failed to create SOS alert' });
  }
});

// Admin: list all SOS alerts
router.get('/', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('CARE'), async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const where = {};
    if (status) where.status = status;
    
    const [alerts, total] = await Promise.all([
      prisma.sosAlert.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        include: {
          user: { select: { id: true, firstName: true, lastName: true, phone: true, avatarUrl: true } },
        },
      }),
      prisma.sosAlert.count({ where }),
    ]);

    // Enrich with driver info where available
    const enrichedAlerts = await Promise.all(alerts.map(async (a) => {
      let driverInfo = null;
      if (a.driverId) {
        try {
          const dp = await prisma.driverProfile.findUnique({
            where: { userId: a.driverId },
            include: { user: { select: { firstName: true, lastName: true, phone: true } } },
          });
          driverInfo = dp ? { name: `${dp.user.firstName} ${dp.user.lastName}`, phone: dp.user.phone, plate: dp.plateNumber, vehicle: dp.vehicleType } : null;
        } catch (e) {}
      }
      return { ...a, driverInfo };
    }));

    return res.json({ alerts: enrichedAlerts, total, page: parseInt(page) });
  } catch (err) {
    console.error('SOS list error:', err);
    return res.status(500).json({ error: 'Failed to fetch SOS alerts' });
  }
});

// Admin: resolve an SOS alert
router.put('/:id/resolve', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('CARE'), async (req, res) => {
  try {
    const alert = await prisma.sosAlert.update({
      where: { id: req.params.id },
      data: { status: 'RESOLVED', resolvedBy: req.user.id, resolvedAt: new Date() },
    });
    return res.json({ alert });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to resolve SOS alert' });
  }
});

module.exports = router;
