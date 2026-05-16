const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { createOrderValidation } = require('../utils/validators');

router.get('/all', requireRole('ADMIN'), orderController.getAllOrders);
router.use(authenticate);
router.post('/', requireRole('RIDER'), createOrderValidation, orderController.createOrder);
router.get('/my', orderController.getMyOrders);
router.get('/store', orderController.getStoreOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id/status', orderController.updateOrderStatus);
router.post('/:id/verify-pickup', orderController.verifyPickup);

module.exports = router;
