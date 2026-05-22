const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const addresses = await prisma.savedAddress.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ addresses });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { label, latitude, longitude, address } = req.body;
    if (!label || !latitude || !longitude) {
      return res.status(400).json({ error: 'label, latitude, and longitude required' });
    }
    const saved = await prisma.savedAddress.create({
      data: { userId: req.userId, label, latitude, longitude, address: address || null },
    });
    return res.status(201).json({ address: saved });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save address' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const existing = await prisma.savedAddress.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!existing) return res.status(404).json({ error: 'Address not found' });
    await prisma.savedAddress.delete({ where: { id: req.params.id } });
    return res.json({ status: 'deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete address' });
  }
});

module.exports = router;
