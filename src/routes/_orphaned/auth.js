const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authCtrl = require('../controllers/authController');
const fcmCtrl = require('../controllers/fcmController');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validate = require('../middleware/validate');

router.post('/register', [
  body('phone').matches(/^\+252[0-9]{7,9}$/).withMessage('Phone must be +252 followed by 7-9 digits'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
], validate, authCtrl.register);

router.post('/login', [
  body('phone').optional(),
  body('email').optional(),
  body('password').notEmpty(),
  (req, res, next) => {
    const id = req.body.phone || req.body.email || req.body.identifier;
    if (!id) return res.status(400).json({ errors: [{ msg: 'Phone or email required' }] });
    next();
  },
], validate, authCtrl.login);

router.get('/me', authMiddleware, authCtrl.me);

// FCM token management
router.post('/fcm-token', authMiddleware, [
  body('fcmToken').notEmpty().withMessage('fcmToken is required'),
], validate, fcmCtrl.registerFcmToken);

router.delete('/fcm-token', authMiddleware, fcmCtrl.removeFcmToken);

// Profile
router.post('/avatar', authMiddleware, upload.single('avatar'), authCtrl.uploadAvatar);
router.put('/profile', authMiddleware, authCtrl.updateProfile);

module.exports = router;
