// ============================================================
// Authentication Routes
// ============================================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const fcmController = require('../controllers/fcmController');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { validate, schemas } = require('../middleware/validation');

// Public routes
router.post('/register', authLimiter, validate(schemas.register), authController.register);
router.post('/login', authLimiter, validate(schemas.login), authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Google OAuth stub — frontend handles Google sign-in, this endpoint
// accepts a verified Google idToken and creates/logs in the user.
router.post('/google', authLimiter, async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) throw new Error('idToken is required');
    // TODO: Verify idToken with Google and create/login user
    // For now, return a helpful error so the frontend knows it's not wired yet
    res.status(501).json({ success: false, error: 'Google sign-in is not fully implemented on the backend yet. Please use phone/password login.' });
  } catch (error) { next(error); }
});

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.put('/me', authenticate, authController.updateProfile);
router.put('/change-password', authenticate, authController.changePassword);
router.post('/logout', authenticate, authController.logout);

// FCM token management
router.post('/fcm-token', authenticate, fcmController.registerFcmToken);
router.delete('/fcm-token', authenticate, fcmController.removeFcmToken);

// Driver specific
router.post('/driver/register', authLimiter, authController.registerDriver);
router.post('/driver/upload-documents', authenticate, authController.uploadDriverDocuments);

module.exports = router;
