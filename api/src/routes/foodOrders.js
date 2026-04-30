const express = require('express');
const router = express.Router();
const foodCtrl = require('../controllers/foodController');
const { authMiddleware, attachUser, roleMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, attachUser, foodCtrl.createFoodOrder);
router.get('/', authMiddleware, attachUser, foodCtrl.getFoodOrders);
router.put('/:id/status', authMiddleware, roleMiddleware('STORE_OWNER', 'ADMIN', 'SUPER_ADMIN'), foodCtrl.updateFoodOrderStatus);
router.put('/:id/verify-pickup', authMiddleware, roleMiddleware('STORE_OWNER', 'ADMIN', 'SUPER_ADMIN'), foodCtrl.verifyPickupPin);
router.put('/:id/verify-arrival', authMiddleware, roleMiddleware('DRIVER'), attachUser, async (req, res) => {
  try {
    const deliveryDispatch = require('../services/deliveryDispatchService');
    const nfcVerified = req.body?.nfcVerified === true;
    const result = await deliveryDispatch.verifyDriverArrival(req.params.id, req.user.id, nfcVerified);
    if (result.arrived) return res.json({ status: 'DRIVER_ARRIVED', distanceMeters: result.distanceKm, method: nfcVerified ? 'NFC' : 'GPS' });
    return res.status(400).json({ error: result.message, distanceMeters: result.distanceKm });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to verify arrival' });
  }
});


// Driver delivery history — food orders assigned to this driver
router.get('/driver/deliveries', authMiddleware, roleMiddleware('DRIVER'), attachUser, async (req, res) => {
  try {
    const prisma = require('../config/prisma');
    const dp = await prisma.driverProfile.findUnique({ where: { userId: req.user.id } });
    if (!dp) return res.status(404).json({ error: 'Driver profile not found' });
    const { status, page = 1, limit = 50 } = req.query;
    const where = { driverId: dp.id };
    if (status) where.status = status;
    const orders = await prisma.foodOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      include: { items: true, restaurant: { select: { id: true, name: true, image: true } } },
    });
    return res.json({ orders, total: orders.length });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch deliveries' });
  }
});

module.exports = router;
