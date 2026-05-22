const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authenticate } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');
const { prisma } = require('../config/database');

function getImageUrl(req) {
  if (req.file) {
    const host = req.get('host');
    return `${req.protocol}://${host}/uploads/${req.file.filename}`;
  }
  return null;
}

router.get('/', storeController.getStores);
router.get('/admin', authenticate, requireRole('ADMIN'), storeController.getAllStoresAdmin);
router.get('/:id', storeController.getStoreById);
router.use(authenticate);
router.get('/my/store', requireRole('STORE_OWNER'), storeController.getMyStore);
router.post('/', requireRole('STORE_OWNER'), upload.single('photo'), storeController.createStore);
router.put('/:id', upload.single('photo'), storeController.updateStore);
router.patch('/:id/toggle-open', requireRole('STORE_OWNER'), storeController.toggleStoreOpen);

// Store owner dashboard
router.get('/dashboard', requireRole('STORE_OWNER'), async (req, res) => {
  try {
    const profile = await prisma.storeOwnerProfile.findUnique({
      where: { userId: req.user.id },
      include: { store: true },
    });
    if (!profile?.store) return res.status(404).json({ error: 'No store found' });

    const store = profile.store;
    const [orders, revenueAgg, products] = await Promise.all([
      prisma.order.count({ where: { storeId: store.id } }),
      prisma.order.aggregate({
        where: { storeId: store.id, status: 'DELIVERED' },
        _sum: { totalAmount: true },
      }),
      prisma.menuItem.count({ where: { storeId: store.id } }),
    ]);

    res.json({
      orders,
      revenue: revenueAgg._sum.totalAmount || 0,
      products,
      rating: store.rating || 5.0,
    });
  } catch (err) {
    console.error('Store dashboard error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard' });
  }
});

// Get store owner's products
router.get('/my-products', requireRole('STORE_OWNER'), async (req, res) => {
  try {
    const profile = await prisma.storeOwnerProfile.findUnique({
      where: { userId: req.user.id },
      include: { store: true },
    });
    if (!profile?.store) return res.status(404).json({ error: 'No store found' });
    const products = await prisma.menuItem.findMany({
      where: { storeId: profile.store.id },
      orderBy: { sortOrder: 'asc' },
      include: { category: true },
    });
    res.json({ success: true, products });
  } catch (err) {
    console.error('Get my products error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Upload store image
router.post('/:id/image', authenticate, requireRole('STORE_OWNER'), upload.single('photo'), async (req, res) => {
  try {
    const store = await prisma.store.findUnique({ where: { id: req.params.id } });
    if (!store) return res.status(404).json({ error: 'Store not found' });
    if (store.ownerId) {
      const profile = await prisma.storeOwnerProfile.findUnique({ where: { userId: req.user.id } });
      if (!profile || profile.storeId !== store.id) {
        return res.status(403).json({ error: 'You can only upload images for your own store' });
      }
    }
    const imageUrl = getImageUrl(req);
    if (!imageUrl) return res.status(400).json({ error: 'No image uploaded' });
    const updated = await prisma.store.update({
      where: { id: req.params.id },
      data: { imageUrl },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Store image upload error:', err);
    res.status(500).json({ error: 'Failed to upload store image' });
  }
});

module.exports = router;
