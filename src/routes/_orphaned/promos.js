const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { authMiddleware } = require('../middleware/auth');

// Apply promo code
router.post('/apply', authMiddleware, async (req, res) => {
  try {
    const { code, orderType, orderAmount } = req.body;
    if (!code) return res.status(400).json({ error: 'Promo code required' });

    const promo = await prisma.promoCode.findUnique({ where: { code } });
    if (!promo) return res.status(404).json({ error: 'Invalid promo code' });
    if (!promo.isActive) return res.status(400).json({ error: 'Promo code is no longer active' });
    if (promo.usedCount >= promo.maxUses) return res.status(400).json({ error: 'Promo code has reached max uses' });
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'Promo code has expired' });
    }

    let discount = 0;
    if (promo.discountType === 'PERCENTAGE') {
      discount = (orderAmount || 0) * (promo.discount / 100);
    } else {
      discount = promo.discount;
    }
    discount = Math.min(discount, orderAmount || discount);

    return res.json({
      valid: true,
      discount: Math.round(discount * 100) / 100,
      discountType: promo.discountType,
      promoCode: promo.code,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to apply promo code' });
  }
});

// Admin: list promo codes
router.get('/', authMiddleware, async (req, res) => {
  try {
    const codes = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
    return res.json({ codes });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch promo codes' });
  }
});

// Admin: create promo code
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { code, discount, discountType, maxUses, expiresAt } = req.body;
    if (!code || !discount) return res.status(400).json({ error: 'code and discount required' });
    const promo = await prisma.promoCode.create({
      data: { code: code.toUpperCase(), discount: parseFloat(discount), discountType: discountType || 'PERCENTAGE', maxUses: parseInt(maxUses) || 100, expiresAt: expiresAt ? new Date(expiresAt) : null },
    });
    return res.status(201).json({ promo });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create promo code' });
  }
});

module.exports = router;
