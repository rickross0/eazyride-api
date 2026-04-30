const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/roleCheck');

router.use(authenticate, requireRole('ADMIN'));
router.get('/dashboard', adminController.getDashboardStats);
router.get('/recent-activity', adminController.getRecentActivity);

// Promo Codes
router.get('/promo-codes', adminController.getPromoCodes);
router.post('/promo-codes', adminController.createPromoCode);
router.delete('/promo-codes/:id', adminController.deletePromoCode);

// Fare Settings
router.get('/fare-settings', requirePermission('VIEW_PRICING'), adminController.getFareSettings);
router.put('/fare-settings/:vehicleType', requirePermission('SET_PRICING'), adminController.updateFareSetting);

// Surge Zones
router.get('/surge-zones', requirePermission('MANAGE_SURGE_ZONES'), adminController.getSurgeZones);
router.post('/surge-zones', requirePermission('MANAGE_SURGE_ZONES'), adminController.createSurgeZone);
router.delete('/surge-zones/:id', requirePermission('MANAGE_SURGE_ZONES'), adminController.deleteSurgeZone);

// Feature Toggles
router.get('/feature-toggles', requirePermission('MANAGE_FEATURE_TOGGLES'), adminController.getFeatureToggles);
router.patch('/feature-toggles/:key', requirePermission('MANAGE_FEATURE_TOGGLES'), adminController.updateFeatureToggle);

// Staff
router.get('/staff', requirePermission('MANAGE_STAFF'), adminController.getStaff);
router.post('/staff', requirePermission('MANAGE_STAFF'), adminController.createStaff);

// Audit Log
router.get('/audit-log', requirePermission('VIEW_AUDIT_LOG'), adminController.getAuditLog);

module.exports = router;
