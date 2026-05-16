// ============================================================
// 🎰 Lottery System Routes — Promotional Giveaway for Drivers
// ============================================================

const express = require('express');
const router = express.Router();
const lotteryController = require('../controllers/lotteryController');
const { authenticate } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/roleCheck');

// Public routes
router.get('/', lotteryController.getLotteries);
router.get('/active', lotteryController.getActiveLottery);
router.get('/:id', lotteryController.getLotteryById);

// Protected routes
router.use(authenticate);

// Drivers enter for free
router.post('/:id/enter', requireRole('DRIVER'), lotteryController.enterLottery);
router.get('/my/entries', lotteryController.getMyEntries);
router.get('/my/history', lotteryController.getMyHistory);

// Admin routes
router.post('/', requirePermission('MANAGE_FEATURE_TOGGLES'), lotteryController.createLottery);
router.put('/:id', requirePermission('MANAGE_FEATURE_TOGGLES'), lotteryController.updateLottery);
router.delete('/:id', requirePermission('MANAGE_FEATURE_TOGGLES'), lotteryController.deleteLottery);
router.post('/:id/draw', requirePermission('MANAGE_FEATURE_TOGGLES'), lotteryController.drawLottery);
router.get('/admin/stats', requirePermission('MANAGE_FEATURE_TOGGLES'), lotteryController.getLotteryStats);

module.exports = router;
