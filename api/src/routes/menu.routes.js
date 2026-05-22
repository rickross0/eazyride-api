const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');
const { prisma } = require('../config/database');

router.get('/:storeId', menuController.getMenuItems);
router.get('/item/:id', menuController.getMenuItemById);
router.get('/:storeId/categories', menuController.getCategories);
router.use(authenticate);
router.post('/', requireRole('STORE_OWNER'), upload.single('photo'), menuController.createMenuItem);
router.put('/:id', requireRole('STORE_OWNER'), upload.single('photo'), menuController.updateMenuItem);
router.delete('/:id', requireRole('STORE_OWNER'), menuController.deleteMenuItem);
router.patch('/:id/toggle', requireRole('STORE_OWNER'), menuController.toggleMenuAvailability);
router.post('/:storeId/categories', requireRole('STORE_OWNER'), menuController.createCategory);

// Upload menu item image
router.post('/:id/image', authenticate, requireRole('STORE_OWNER'), upload.single('photo'), async (req, res) => {
  try {
    const item = await prisma.menuItem.findUnique({ where: { id: req.params.id } });
    if (!item) return res.status(404).json({ error: 'Menu item not found' });
    const host = req.get('host');
    const imageUrl = req.file ? `${req.protocol}://${host}/uploads/${req.file.filename}` : null;
    if (!imageUrl) return res.status(400).json({ error: 'No image uploaded' });
    const updated = await prisma.menuItem.update({
      where: { id: req.params.id },
      data: { imageUrl },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Menu item image upload error:', err);
    res.status(500).json({ error: 'Failed to upload menu item image' });
  }
});

module.exports = router;
