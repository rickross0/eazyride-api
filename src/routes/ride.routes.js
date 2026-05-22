const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

router.use(authenticate);

// Debug: log every ride request
router.use((req, res, next) => {
  console.log(`[RIDE ROUTE] ${req.method} ${req.path} — user: ${req.user?.id}, role: ${req.user?.role}`);
  console.log('[RIDE ROUTE] BODY:', JSON.stringify(req.body));
  next();
});

router.post('/', requireRole('RIDER'), rideController.createRide);
router.get('/all', requireRole('ADMIN'), rideController.getAllRides);
router.get('/:id', rideController.getRideById);
router.post('/:id/accept', requireRole('DRIVER'), rideController.acceptRide);
router.put('/:id/status', rideController.updateRideStatus);
router.post('/:id/rate', rideController.rateRide);
router.post('/:id/offer', requireRole('DRIVER'), rideController.createRideOffer);
router.post('/:id/cancel', rideController.cancelRide);

module.exports = router;
