const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { authenticate } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/roleCheck');

router.get('/online', driverController.getOnlineDrivers);
router.use(authenticate);
router.get('/profile', requireRole('DRIVER'), driverController.getDriverProfile);
router.put('/profile', requireRole('DRIVER'), driverController.updateDriverProfile);
router.put('/location', requireRole('DRIVER'), driverController.updateLocation);
router.put('/toggle-online', requireRole('DRIVER'), driverController.toggleOnline);
router.get('/earnings', requireRole('DRIVER'), driverController.getDriverEarnings);

// Admin
router.get('/', requireRole('ADMIN'), driverController.getAllDrivers);
router.patch('/:id/approve', requirePermission('APPROVE_DRIVERS'), driverController.approveDriver);
router.patch('/:id/reject', requirePermission('APPROVE_DRIVERS'), driverController.rejectDriver);
router.patch('/:id/suspend', requirePermission('SUSPEND_USERS'), driverController.suspendDriver);

module.exports = router;
