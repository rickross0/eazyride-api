const express = require('express');
const upload = require('../middleware/upload');
const router = express.Router();
const foodCtrl = require('../controllers/foodController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

// Public/read routes
router.get('/', authMiddleware, foodCtrl.getMenuItems);

// Store owner / Admin CRUD routes
router.post('/', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN', 'STORE_OWNER'), upload.single('photo'), foodCtrl.createMenuItem);
router.put('/:id', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN', 'STORE_OWNER'), upload.single('photo'), foodCtrl.updateMenuItem);
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN', 'STORE_OWNER'), foodCtrl.deleteMenuItem);

module.exports = router;
