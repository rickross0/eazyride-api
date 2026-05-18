const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

router.use(authenticate);
router.get('/', walletController.getWallet);
router.get('/transactions', walletController.getTransactions);
router.post('/payout', walletController.requestPayout);
router.post('/deposit', walletController.deposit);

// Admin
router.get('/payouts', requireRole('ADMIN'), walletController.getPayouts);
router.patch('/payouts/:id/approve', requireRole('ADMIN'), walletController.approvePayout);
router.patch('/payouts/:id/complete', requireRole('ADMIN'), walletController.completePayout);

module.exports = router;
