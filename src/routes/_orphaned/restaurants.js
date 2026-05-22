const prisma = require('../config/prisma');
const express = require('express');
const upload = require('../middleware/upload');
const router = express.Router();
const foodCtrl = require('../controllers/foodController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Public/read routes
router.get('/', authMiddleware, foodCtrl.listRestaurants);

// ── Store Owner: My Restaurant Stats ─────────────────────────
router.get('/me/stats', authMiddleware, roleMiddleware('STORE_OWNER'), async (req, res) => {
  try {
    const store = await prisma.store.findFirst({ where: { ownerId: req.userId } });
    if (!store) return res.status(404).json({ error: 'No restaurant found' });

    const [completedOrders, pendingOrders, totalOrders] = await Promise.all([
      prisma.order.count({ where: { storeId: store.id, status: 'DELIVERED' } }),
      prisma.order.count({ where: { storeId: store.id, status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'] } } }),
      prisma.order.count({ where: { storeId: store.id } }),
    ]);

    const totalEarningsResult = await prisma.order.aggregate({
      where: { storeId: store.id, status: 'DELIVERED' },
      _sum: { totalAmount: true },
    });

    const pendingEarningsResult = await prisma.order.aggregate({
      where: { storeId: store.id, status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVED', 'PICKUP_CONFIRMED', 'OUT_FOR_DELIVERY'] } },
      _sum: { totalAmount: true },
    });

    const totalEarnings = totalEarningsResult._sum.totalAmount || 0;
    const pendingAmount = pendingEarningsResult._sum.totalAmount || 0;
    const commissionRate = store.commissionRate ?? 10;
    const totalCommission = Math.round(totalEarnings * commissionRate / 100 * 100) / 100;
    const netEarnings = Math.round((totalEarnings - totalCommission) * 100) / 100;

    res.json({
      restaurantId: store.id,
      restaurantName: store.name,
      totalOrders,
      completedOrders,
      pendingOrders,
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      pendingAmount: Math.round(pendingAmount * 100) / 100,
      paidOut: Math.round((totalEarnings - pendingAmount) * 100) / 100,
      commissionRate,
      totalCommission,
      netEarnings,
    });
  } catch (err) {
    console.error('Restaurant stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

router.get('/me/transactions', authMiddleware, roleMiddleware('STORE_OWNER'), async (req, res) => {
  try {
    const store = await prisma.store.findFirst({ where: { ownerId: req.userId } });
    if (!store) return res.status(404).json({ error: 'No restaurant found' });

    const orders = await prisma.order.findMany({
      where: { storeId: store.id, status: { in: ['DELIVERED', 'OUT_FOR_DELIVERY', 'PICKUP_CONFIRMED'] } },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true, createdAt: true, status: true,
        totalAmount: true, subtotal: true, serviceFee: true, deliveryFee: true,
        items: { select: { name: true, quantity: true, unitPrice: true } },
      },
    });

    const commissionRate = store.commissionRate ?? 10;
    const transactions = orders.map((o) => ({
      id: o.id,
      createdAt: o.createdAt,
      status: o.status,
      amount: o.totalAmount,
      commission: Math.round(o.totalAmount * commissionRate / 100 * 100) / 100,
      netAmount: Math.round((o.totalAmount - o.totalAmount * commissionRate / 100) * 100) / 100,
      itemCount: o.items.reduce((s, i) => s + i.quantity, 0),
      type: 'completed_order',
    }));

    res.json({ transactions });
  } catch (err) {
    console.error('Restaurant transactions error:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

router.get('/me/profile', authMiddleware, roleMiddleware('STORE_OWNER'), async (req, res) => {
  try {
    const store = await prisma.store.findFirst({ where: { ownerId: req.userId } });
    if (!store) return res.status(404).json({ error: 'No restaurant found' });
    res.json({ restaurant: store });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch restaurant profile' });
  }
});

// GET /restaurants/me - Get current store owner store
router.get('/me', authMiddleware, roleMiddleware('STORE_OWNER'), async (req, res) => {
  try {
    const store = await prisma.store.findUnique({ where: { ownerId: req.userId } });
    if (!store) return res.status(404).json({ error: 'No store found' });
    res.json({ store, restaurant: store, category: store.category });
  } catch (err) {
    console.error('Get store error:', err);
    res.status(500).json({ error: 'Failed to fetch store' });
  }
});

router.put('/me', authMiddleware, roleMiddleware('STORE_OWNER'), async (req, res) => {
  try {
    const store = await prisma.store.findFirst({ where: { ownerId: req.userId } });
    if (!store) return res.status(404).json({ error: 'No restaurant found' });

    const { name, description, phone, address, isActive, openingTime, closingTime, deliveryFee, minOrder } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (openingTime !== undefined) updateData.openingTime = openingTime;
    if (closingTime !== undefined) updateData.closingTime = closingTime;
    if (deliveryFee !== undefined) updateData.deliveryFee = parseFloat(deliveryFee);
    if (minOrder !== undefined) updateData.minOrder = parseFloat(minOrder);

    const updated = await prisma.store.update({ where: { id: store.id }, data: updateData });
    res.json({ restaurant: updated });
  } catch (err) {
    console.error('Update restaurant error:', err);
    res.status(500).json({ error: 'Failed to update restaurant' });
  }
});

router.get('/:id', authMiddleware, foodCtrl.getRestaurant);

// Store owner / Admin CRUD routes
router.post('/', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN', 'STORE_OWNER'), upload.single('photo'), foodCtrl.createRestaurant);
router.put('/:id', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN', 'STORE_OWNER'), upload.single('photo'), foodCtrl.updateRestaurant);
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN', 'STORE_OWNER'), foodCtrl.deleteRestaurant);

module.exports = router;
