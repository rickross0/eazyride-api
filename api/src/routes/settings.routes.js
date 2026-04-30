const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticate } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/roleCheck');

// Public
router.get('/support-contacts', settingsController.getSupportContacts);
router.get('/legal/:type', settingsController.getLegalDocument);

// Admin
router.use(authenticate);
router.use(requireRole('ADMIN'));
router.post('/support-contacts', settingsController.createSupportContact);
router.put('/support-contacts/:id', settingsController.updateSupportContact);
router.delete('/support-contacts/:id', settingsController.deleteSupportContact);
router.put('/legal/:type', requirePermission('UPDATE_TERMS'), settingsController.updateLegalDocument);
router.get('/app', settingsController.getAppSettings);
router.put('/app', settingsController.updateAppSetting);

module.exports = router;
