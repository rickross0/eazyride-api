// ============================================================
// Promotions Routes
// ============================================================

const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { authenticate } = require('../middleware/auth');
const { requireRole, requirePermission, PERMISSIONS } = require('../middleware/roleCheck');

// Public routes
router.get('/active', promotionController.getActivePromotions);

// Protected routes
router.use(authenticate);

// All authenticated users can view
router.get('/', promotionController.getPromotions);
router.get('/:id', promotionController.getPromotionById);

// Admin only routes
router.post('/', requirePermission('MANAGE_SETTINGS'), promotionController.createPromotion);
router.put('/:id', requirePermission('MANAGE_SETTINGS'), promotionController.updatePromotion);
router.delete('/:id', requirePermission('MANAGE_SETTINGS'), promotionController.deletePromotion);

module.exports = router;
