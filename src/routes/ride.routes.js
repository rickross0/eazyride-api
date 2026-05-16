const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { createRideValidation } = require('../utils/validators');

router.use(authenticate);
router.post('/', requireRole('RIDER'), createRideValidation, rideController.createRide);
router.get('/all', requireRole('ADMIN'), rideController.getAllRides);
router.get('/:id', rideController.getRideById);
router.post('/:id/accept', requireRole('DRIVER'), rideController.acceptRide);
router.put('/:id/status', rideController.updateRideStatus);
router.post('/:id/rate', rideController.rateRide);
router.post('/:id/offer', requireRole('DRIVER'), rideController.createRideOffer);
router.post('/:id/cancel', rideController.cancelRide);

module.exports = router;
