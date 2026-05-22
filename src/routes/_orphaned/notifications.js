const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const prisma = require('../config/prisma');

// ── Get Current User's Notifications ───────────────────────
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const where = { userId: req.userId };
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.notification.count({ where }),
    ]);
    res.json({ notifications, page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error('Notifications fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// ── Mark Notification as Read ───────────────────────────────
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
    if (!notification || notification.userId !== req.userId) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    res.json({ notification: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// ── Mark All as Read ────────────────────────────────────────
router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.userId, read: false },
      data: { read: true },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

module.exports = router;
const fcmController = require('../controllers/fcmController');

// ── FCM Token Registration ────────────────────────────────
router.post('/fcm/token', authMiddleware, fcmController.registerFcmToken);
router.delete('/fcm/token', authMiddleware, fcmController.removeFcmToken);
