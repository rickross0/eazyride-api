const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

router.use(authenticate);
router.get('/me', userController.getProfile);
router.put('/me', upload.single('avatar'), userController.updateProfile);
router.get('/addresses', userController.getSavedAddresses);
router.post('/addresses', userController.addSavedAddress);
router.delete('/addresses/:id', userController.deleteSavedAddress);

// Admin
router.get('/', requireRole('ADMIN'), userController.getAllUsers);
router.get('/:id', requireRole('ADMIN'), userController.getUserById);
router.patch('/:id/status', requirePermission('SUSPEND_USERS'), userController.toggleUserStatus);
router.delete('/:id', requirePermission('DELETE_USERS'), userController.deleteUser);

module.exports = router;
