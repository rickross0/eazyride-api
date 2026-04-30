const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authenticate } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/roleCheck');

router.get('/', storeController.getStores);
router.get('/admin', authenticate, requireRole('ADMIN'), storeController.getAllStoresAdmin);
router.get('/:id', storeController.getStoreById);
router.use(authenticate);
router.get('/my/store', requireRole('STORE_OWNER'), storeController.getMyStore);
router.post('/', requireRole('STORE_OWNER'), storeController.createStore);
router.put('/:id', storeController.updateStore);
router.patch('/:id/toggle-open', requireRole('STORE_OWNER'), storeController.toggleStoreOpen);

module.exports = router;
