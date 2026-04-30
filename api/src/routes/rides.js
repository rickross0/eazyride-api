const express = require('express');
const router = express.Router();
const rideCtrl = require('../controllers/rideController');
const { authMiddleware, roleMiddleware, attachUser } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

router.get('/estimate', authMiddleware, rideCtrl.estimateFare);
router.post('/request', authMiddleware, roleMiddleware('RIDER'), attachUser, [
  body('pickupLat').isFloat(),
  body('pickupLng').isFloat(),
  body('dropoffLat').optional({ nullable: true }).isFloat(),
  body('dropoffLng').optional({ nullable: true }).isFloat(),
], validate, rideCtrl.requestRide);
router.get('/', authMiddleware, attachUser, rideCtrl.getRides);
router.post('/:id/rate', authMiddleware, attachUser, rideCtrl.rateRide);
router.get('/:id', authMiddleware, attachUser, rideCtrl.getRideById);
router.get('/:id/driver-location', authMiddleware, attachUser, rideCtrl.getDriverLocation);
router.put('/:id/accept', authMiddleware, roleMiddleware('DRIVER'), attachUser, rideCtrl.acceptRide);
router.put('/:id/decline', authMiddleware, roleMiddleware('DRIVER'), attachUser, rideCtrl.declineRide);
router.put('/:id/start', authMiddleware, roleMiddleware('DRIVER'), attachUser, rideCtrl.startRide);
router.put('/:id/complete', authMiddleware, roleMiddleware('DRIVER'), attachUser, rideCtrl.completeRide);
router.post('/:id/cancel', authMiddleware, attachUser, rideCtrl.cancelRide);

module.exports = router;
