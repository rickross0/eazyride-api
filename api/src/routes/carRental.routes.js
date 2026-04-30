const express = require('express');
const router = express.Router();
const carRentalController = require('../controllers/carRentalController');
const { authenticate } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/roleCheck');
const { createBookingValidation } = require('../utils/validators');

router.get('/cars', carRentalController.getCars);
router.get('/cars/:id', carRentalController.getCarById);
router.use(authenticate);
router.get('/bookings/my', carRentalController.getMyBookings);
router.get('/bookings/provider', requireRole('SERVICE_PROVIDER'), carRentalController.getProviderBookings);
router.get('/bookings/:id', carRentalController.getBookingById);
router.put('/bookings/:id/status', carRentalController.updateBookingStatus);
router.post('/cars', requireRole('SERVICE_PROVIDER'), carRentalController.createCar);
router.put('/cars/:id', requireRole('SERVICE_PROVIDER'), carRentalController.updateCar);
router.delete('/cars/:id', requireRole('SERVICE_PROVIDER'), carRentalController.deleteCar);
router.post('/bookings', requireRole('RIDER'), createBookingValidation, carRentalController.createBooking);
router.patch('/cars/:id/verify', requirePermission('VERIFY_CARS'), carRentalController.verifyCar);

module.exports = router;
