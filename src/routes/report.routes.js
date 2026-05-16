const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate } = require('../middleware/auth');
const { requirePermission } = require('../middleware/roleCheck');

router.use(authenticate);
router.get('/revenue', requirePermission('VIEW_REPORTS'), reportController.getRevenueReport);
router.get('/user-growth', requirePermission('VIEW_REPORTS'), reportController.getUserGrowthReport);
router.get('/ride-stats', requirePermission('VIEW_REPORTS'), reportController.getRideStatsReport);

module.exports = router;
