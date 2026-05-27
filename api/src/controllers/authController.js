// ============================================================
// Authentication Controller
// ============================================================

const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');
const { generateTokens } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');
const { generateId } = require('../utils/helpers');
const logger = require('../utils/logger');

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { phone, email, password, firstName, lastName, role } = req.body;
    
    // Validate role
    const validRoles = ['RIDER', 'DRIVER', 'STORE_OWNER', 'SERVICE_PROVIDER', 'RENTAL_COMPANY'];
    if (role && !validRoles.includes(role)) {
      throw new AppError('Invalid role specified', 400);
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone },
          ...(email ? [{ email }] : [])
        ]
      }
    });

    if (existingUser) {
      throw new AppError('User with this phone or email already exists', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        phone,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'RIDER'
      }
    });

    // Create rider profile
    await prisma.riderProfile.create({
      data: {
        userId: user.id
      }
    });

    // Create wallet
    await prisma.wallet.create({
      data: {
        userId: user.id,
        balance: 0
      }
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Remove password from response
    delete user.password;

    logger.info(`New user registered: ${user.phone}`);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Register driver
exports.registerDriver = async (req, res, next) => {
  try {
    const { phone, email, password, firstName, lastName, vehicleType, vehiclePlate } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone },
          ...(email ? [{ email }] : [])
        ]
      }
    });

    if (existingUser) {
      throw new AppError('User with this phone or email already exists', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        phone,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'DRIVER'
      }
    });

    // Create driver profile
    await prisma.driverProfile.create({
      data: {
        userId: user.id,
        vehicleType,
        vehiclePlate,
        status: 'PENDING'
      }
    });

    // Create wallet
    await prisma.wallet.create({
      data: {
        userId: user.id,
        balance: 0
      }
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    logger.info(`New driver registered: ${user.phone}`);

    res.status(201).json({
      success: true,
      message: 'Driver registration successful. Pending approval.',
      data: {
        user,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login
exports.login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { phone },
      include: {
        riderProfile: true,
        driverProfile: true,
        storeOwnerProfile: true,
        providerProfile: true,
        adminProfile: true,
        wallet: true
      }
    });

    if (!user) {
      throw new AppError('Invalid phone or password', 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid phone or password', 401);
    }

    // Check if account is active
    if (!user.isActive) {
      throw new AppError('Account is deactivated. Please contact support.', 403);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Remove password from response
    delete user.password;

    logger.info(`User logged in: ${user.phone}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        riderProfile: true,
        driverProfile: true,
        storeOwnerProfile: {
          include: {
            store: true
          }
        },
        providerProfile: true,
        adminProfile: true,
        wallet: true
      }
    });

    delete user.password;

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Update profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
        ...(avatar && { avatar })
      }
    });

    delete user.password;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token is required', 400);
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    if (decoded.type !== 'refresh') {
      throw new AppError('Invalid refresh token', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401);
    }

    const tokens = generateTokens(user.id);

    res.json({
      success: true,
      data: tokens
    });
  } catch (error) {
    next(error);
  }
};

// Logout
exports.logout = async (req, res) => {
  // In a real app, you might want to invalidate the token
  // For now, just return success
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { phone } = req.body;

    const user = await prisma.user.findUnique({ where: { phone } });
    
    if (!user) {
      // Don't reveal if user exists
      return res.json({
        success: true,
        message: 'If an account exists, a reset code will be sent'
      });
    }

    // TODO: Send OTP via SMS
    
    res.json({
      success: true,
      message: 'Reset code sent to your phone'
    });
  } catch (error) {
    next(error);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { phone, code, newPassword } = req.body;

    // TODO: Verify OTP code
    
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { phone },
      data: { password: hashedPassword }
    });

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

// Upload driver documents
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) throw new AppError('No image uploaded', 400);
    const filename = req.file.filename;
    const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
    
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar: avatarUrl },
    });
    
    res.json({ success: true, data: { avatar: avatarUrl } });
  } catch (error) { next(error); }
};

exports.uploadDriverDocuments = async (req, res, next) => {
  try {
    // Documents would be uploaded via multer
    const documents = req.body.documents;

    await prisma.driverProfile.update({
      where: { userId: req.user.id },
      data: { documents }
    });

    res.json({
      success: true,
      message: 'Documents uploaded successfully'
    });
  } catch (error) {
    next(error);
  }
};
