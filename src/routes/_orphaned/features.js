const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const prisma = require('../config/prisma');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const toggles = await prisma.featureToggle.findMany();
    const map = {};
    toggles.forEach((t) => { map[t.feature] = t.isEnabled; });
    res.json({ features: map });
  } catch (err) { res.status(500).json({ error: 'Failed to get features' }); }
});

module.exports = router;
