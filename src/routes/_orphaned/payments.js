const express = require('express');
const router = express.Router();
const payCtrl = require('../controllers/paymentController');
const { authMiddleware, attachUser } = require('../middleware/auth');

router.post('/webhook', payCtrl.waafiWebhook);
router.post('/initiate', authMiddleware, attachUser, payCtrl.initiatePayment);
router.post('/hold', authMiddleware, attachUser, payCtrl.preauthorizeHold);
module.exports = router;
