const express = require('express');
const router = express.Router();
const carRentalController = require('../controllers/carRentalController');
const { authenticate } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/roleCheck');
const { createBookingValidation } = require('../utils/validators');
const { getInheritedRoles } = require('../utils/roleHierarchy');

// Get provider roles (includes sub-roles)
const providerRoles = getInheritedRoles('SERVICE_PROVIDER');

router.get('/cars', carRentalController.getCars);
router.get('/cars/:id', carRentalController.getCarById);
router.use(authenticate);
router.get('/bookings/my', carRentalController.getMyBookings);
router.get('/bookings/provider', requireRole(...providerRoles), carRentalController.getProviderBookings);
router.get('/bookings/:id', carRentalController.getBookingById);
router.put('/bookings/:id/status', carRentalController.updateBookingStatus);
router.post('/cars', requireRole(...providerRoles), carRentalController.createCar);
router.put('/cars/:id', requireRole(...providerRoles), carRentalController.updateCar);
router.delete('/cars/:id', requireRole(...providerRoles), carRentalController.deleteCar);
router.post('/bookings', requireRole('RIDER'), createBookingValidation, carRentalController.createBooking);
router.patch('/cars/:id/verify', requirePermission('VERIFY_CARS'), carRentalController.verifyCar);

module.exports = router;
