const express = require('express');
const router = express.Router();
const waafiPay = require('../services/waafiPay');
const { authMiddleware, attachUser } = require('../middleware/auth');

router.post('/callback', async (req, res) => {
  try {
    const event = req.body?.event;
    if (event === 'webhook.test') return res.status(200).send('OK');
    if (!waafiPay.verifyWebhook(req)) return res.status(401).json({ error: 'Invalid signature' });
    const payment = req.body?.payment;
    if (!payment) return res.status(400).json({ error: 'Missing payment' });
    return res.status(200).send('OK');
  } catch (err) {
    return res.status(500).json({ error: 'Callback failed' });
  }
});

router.post('/initiate', authMiddleware, attachUser, async (req, res) => {
  try {
    const { phone, amount, referenceType, referenceId } = req.body;
    const ref = `${referenceType || 'evc'}:${referenceId || Date.now()}`;
    const result = await waafiPay.initiatePurchase(phone, amount, ref);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/hold', authMiddleware, attachUser, async (req, res) => {
  try {
    const { phone, amount, referenceType, referenceId } = req.body;
    const ref = `${referenceType || 'hold'}:${referenceId || Date.now()}`;
    const result = await waafiPay.preauthorize(phone, amount, ref);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
