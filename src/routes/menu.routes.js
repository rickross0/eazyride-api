const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

router.get('/:storeId', menuController.getMenuItems);
router.get('/item/:id', menuController.getMenuItemById);
router.get('/:storeId/categories', menuController.getCategories);
router.use(authenticate);
router.post('/', requireRole('STORE_OWNER', 'ADMIN'), menuController.createMenuItem);
router.put('/:id', requireRole('STORE_OWNER', 'ADMIN'), menuController.updateMenuItem);
router.delete('/:id', requireRole('STORE_OWNER', 'ADMIN'), menuController.deleteMenuItem);
router.patch('/:id/toggle', requireRole('STORE_OWNER', 'ADMIN'), menuController.toggleMenuAvailability);
router.post('/:storeId/categories', requireRole('STORE_OWNER', 'ADMIN'), menuController.createCategory);

module.exports = router;
