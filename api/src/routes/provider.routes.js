const express = require('express');
const router = express.Router();
const providerController = require('../controllers/providerController');
const { authenticate } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/roleCheck');
const { getInheritedRoles } = require('../utils/roleHierarchy');

// Get provider roles (includes sub-roles)
const providerRoles = getInheritedRoles('SERVICE_PROVIDER');

router.get('/', providerController.getProviders);
router.get('/admin', authenticate, requireRole('ADMIN'), providerController.getAllProvidersAdmin);
router.get('/:id', providerController.getProviderById);
router.use(authenticate);
router.get('/my/profile', requireRole(...providerRoles), providerController.getMyProviderProfile);
router.put('/my/profile', requireRole(...providerRoles), providerController.updateProviderProfile);
router.patch('/toggle-availability', requireRole(...providerRoles), providerController.toggleAvailability);
router.patch('/:id/approve', requirePermission('APPROVE_PROVIDERS'), providerController.approveProvider);

module.exports = router;
