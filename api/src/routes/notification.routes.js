const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

router.use(authenticate);
router.get('/', notificationController.getMyNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read', notificationController.markAsRead);
router.patch('/:id/read', notificationController.markOneAsRead);

// Admin
router.post('/send', requireRole('ADMIN'), notificationController.sendNotification);
router.post('/send-bulk', requireRole('ADMIN'), notificationController.sendBulkNotification);

module.exports = router;
