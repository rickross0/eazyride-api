const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

router.post('/initiate', authenticate, paymentController.initiatePayment);
router.get('/status/:referenceId', authenticate, paymentController.getPaymentStatus);
router.post('/webhook/waafipay', paymentController.waafiPayWebhook);

module.exports = router;
