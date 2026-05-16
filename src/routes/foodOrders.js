const express = require('express');
const router = express.Router();
const foodCtrl = require('../controllers/foodController');
const { authMiddleware, attachUser, roleMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, attachUser, foodCtrl.createFoodOrder);
router.get('/', authMiddleware, attachUser, foodCtrl.getFoodOrders);

// Store owner: get orders for my store
router.get('/store', authMiddleware, roleMiddleware('STORE_OWNER'), attachUser, async (req, res) => {
  try {
    const prisma = require('../config/prisma');
    const store = await prisma.store.findFirst({ where: { ownerId: req.user.id } });
    if (!store) return res.status(404).json({ error: 'No store found for this owner' });

    const { status, page = 1, limit = 20 } = req.query;
    const where = { storeId: store.id };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        include: {
          items: true,
          rider: { select: { id: true, firstName: true, phone: true } },
          driver: { select: { id: true, firstName: true, phone: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return res.json({ orders, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error('Store orders error:', err);
    return res.status(500).json({ error: 'Failed to fetch store orders' });
  }
});

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

// Driver delivery history — orders assigned to this driver
router.get('/driver/deliveries', authMiddleware, roleMiddleware('DRIVER'), attachUser, async (req, res) => {
  try {
    const prisma = require('../config/prisma');
    const { status, page = 1, limit = 50 } = req.query;
    const where = { driverId: req.user.id };
    if (status) where.status = status;
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      include: { items: true, store: { select: { id: true, name: true, imageUrl: true } } },
    });
    return res.json({ orders, total: orders.length });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch deliveries' });
  }
});

module.exports = router;
