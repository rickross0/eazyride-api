// ============================================================
// Notification Controller — v3.0.0
// ============================================================

const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { paginate, paginationResponse } = require('../utils/helpers');
const { sendNotification, sendMulticastNotification } = require('../services/notificationService');

exports.getMyNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { skip, take, page: p, limit: l } = paginate(page, limit);
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({ where: { userId: req.user.id }, skip, take: l, orderBy: { createdAt: 'desc' } }),
      prisma.notification.count({ where: { userId: req.user.id } }),
    ]);
    res.json({ success: true, ...paginationResponse(notifications, total, p, l) });
  } catch (error) { next(error); }
};

exports.markAsRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    res.json({ success: true, message: 'All marked as read' });
  } catch (error) { next(error); }
};

exports.markOneAsRead = async (req, res, next) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true, readAt: new Date() },
    });
    res.json({ success: true });
  } catch (error) { next(error); }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await prisma.notification.count({ where: { userId: req.user.id, isRead: false } });
    res.json({ success: true, data: { count } });
  } catch (error) { next(error); }
};

// Admin: send notification
exports.sendNotification = async (req, res, next) => {
  try {
    const { userId, title, body, data } = req.body;
    const result = await sendNotification({ userId, title, body, data });
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

exports.sendBulkNotification = async (req, res, next) => {
  try {
    const { userIds, title, body, data } = req.body;
    const result = await sendMulticastNotification({ userIds, title, body, data });
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};
