// ============================================================
// SOS Controller — v3.0.0
// ============================================================

const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { emitToAdmins } = require('../services/socketService');
const { sendRoleNotification } = require('../services/notificationService');
const logger = require('../utils/logger');

exports.createSOS = async (req, res, next) => {
  try {
    const { location, address, message, rideId, orderId } = req.body;
    const alert = await prisma.sOSAlert.create({
      data: { userId: req.user.id, location, address, message, rideId, orderId, status: 'ACTIVE' },
    });
    // Notify admins
    emitToAdmins('sos:alert', { alertId: alert.id, userId: req.user.id, message, location });
    await sendRoleNotification({ role: 'ADMIN', title: '🚨 SOS Alert', body: message || 'Emergency alert received', data: { type: 'SOS', alertId: alert.id } });
    logger.warn(`SOS Alert from ${req.user.id}: ${message}`);
    res.status(201).json({ success: true, data: alert });
  } catch (error) { next(error); }
};

exports.resolveSOS = async (req, res, next) => {
  try {
    const alert = await prisma.sOSAlert.update({
      where: { id: req.params.id },
      data: { status: 'RESOLVED', resolvedAt: new Date(), resolvedBy: req.user.id },
    });
    res.json({ success: true, data: alert });
  } catch (error) { next(error); }
};

exports.getActiveAlerts = async (req, res, next) => {
  try {
    const alerts = await prisma.sOSAlert.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, firstName: true, lastName: true, phone: true } } },
    });
    res.json({ success: true, data: alerts });
  } catch (error) { next(error); }
};

exports.getAllAlerts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const [alerts, total] = await Promise.all([
      prisma.sOSAlert.findMany({ skip, take: parseInt(limit), orderBy: { createdAt: 'desc' }, include: { user: { select: { firstName: true, lastName: true, phone: true } } } }),
      prisma.sOSAlert.count(),
    ]);
    res.json({ success: true, data: alerts, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) { next(error); }
};
