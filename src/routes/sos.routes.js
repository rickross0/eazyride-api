const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sosController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

router.post('/', authenticate, sosController.createSOS);
router.use(authenticate);
router.get('/active', requireRole('ADMIN'), sosController.getActiveAlerts);
router.get('/', requireRole('ADMIN'), sosController.getAllAlerts);
router.patch('/:id/resolve', requireRole('ADMIN'), sosController.resolveSOS);

module.exports = router;
