const express = require('express');
const router = express.Router();
const riderController = require('../controllers/riderController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

router.use(authenticate);
router.get('/profile', requireRole('RIDER'), riderController.getRiderProfile);
router.put('/profile', requireRole('RIDER'), riderController.updateRiderProfile);
router.get('/rides', requireRole('RIDER'), riderController.getRideHistory);
router.get('/orders', requireRole('RIDER'), riderController.getOrderHistory);
router.get('/bookings', requireRole('RIDER'), riderController.getRentalHistory);
router.put('/fcm-token', riderController.updateFCMToken);

module.exports = router;
