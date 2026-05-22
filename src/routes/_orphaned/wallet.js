const express = require('express');
const router = express.Router();
const walletCtrl = require('../controllers/walletController');
const { authMiddleware, attachUser } = require('../middleware/auth');

router.get('/balance', authMiddleware, attachUser, walletCtrl.getBalance);
router.post('/deposit', authMiddleware, attachUser, walletCtrl.deposit);
router.post('/withdraw', authMiddleware, attachUser, walletCtrl.withdraw);
router.get('/transactions', authMiddleware, attachUser, walletCtrl.getTransactions);

module.exports = router;
