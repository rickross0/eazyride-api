const express = require('express');
const router = express.Router();
const carCtrl = require('../controllers/carRentalController');
const { authMiddleware, attachUser } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');

router.get('/', authMiddleware, carCtrl.listCars);
router.get('/categories', carCtrl.listCategories);

// List current user's own cars (for store-owner car management)
router.get('/me', authMiddleware, attachUser, async (req, res) => {
  try {
    const prisma = require('../config/prisma');
    const cars = await prisma.car.findMany({
      where: { ownerId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { id: true, name: true } } },
    });
    return res.json({ cars });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch your cars' });
  }
});

// Delete a car (owner only)
router.delete('/:id', authMiddleware, attachUser, async (req, res) => {
  try {
    const prisma = require('../config/prisma');
    const car = await prisma.car.findUnique({ where: { id: req.params.id } });
    if (!car) return res.status(404).json({ error: 'Car not found' });
    if (car.ownerId !== req.user.id) return res.status(403).json({ error: 'Not your car' });
    await prisma.car.delete({ where: { id: req.params.id } });
    return res.json({ status: 'deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete car' });
  }
});

router.get('/:id', authMiddleware, carCtrl.getCar);
router.post('/', authMiddleware, attachUser, carCtrl.createCar);
router.post('/upload', authMiddleware, upload.single('photo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const url = `${baseUrl}/uploads/${req.file.filename}`;
  return res.json({ url, filename: req.file.filename });
});
router.put('/:id', authMiddleware, carCtrl.updateCar);
module.exports = router;
