// ============================================================
// 📢 Promotions Controller
// ============================================================

const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Get active promotions
exports.getActivePromotions = async (req, res, next) => {
  try {
    const now = new Date();
    
    const promotions = await prisma.promotion.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now }
      },
      orderBy: { displayOrder: 'asc' }
    });

    res.json({
      success: true,
      data: promotions
    });
  } catch (error) {
    next(error);
  }
};

// Get all promotions (Admin)
exports.getPromotions = async (req, res, next) => {
  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: promotions
    });
  } catch (error) {
    next(error);
  }
};

// Get promotion by ID
exports.getPromotionById = async (req, res, next) => {
  try {
    const promotion = await prisma.promotion.findUnique({
      where: { id: req.params.id }
    });

    if (!promotion) {
      throw new AppError('Promotion not found', 404);
    }

    res.json({
      success: true,
      data: promotion
    });
  } catch (error) {
    next(error);
  }
};

// Create promotion (Admin only)
exports.createPromotion = async (req, res, next) => {
  try {
    const {
      title,
      description,
      imageUrl,
      type,
      targetRole,
      targetScreen,
      actionUrl,
      startDate,
      endDate,
      displayOrder
    } = req.body;

    const promotion = await prisma.promotion.create({
      data: {
        title,
        description,
        imageUrl,
        type,
        targetRole,
        targetScreen,
        actionUrl,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        displayOrder: displayOrder || 0
      }
    });

    logger.info(`New promotion created: ${promotion.title}`);

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('promotion:new', promotion);
    }

    res.status(201).json({
      success: true,
      message: 'Promotion created successfully',
      data: promotion
    });
  } catch (error) {
    next(error);
  }
};

// Update promotion (Admin only)
exports.updatePromotion = async (req, res, next) => {
  try {
    const promotion = await prisma.promotion.findUnique({
      where: { id: req.params.id }
    });

    if (!promotion) {
      throw new AppError('Promotion not found', 404);
    }

    const updated = await prisma.promotion.update({
      where: { id: req.params.id },
      data: {
        ...req.body,
        ...(req.body.startDate && { startDate: new Date(req.body.startDate) }),
        ...(req.body.endDate && { endDate: new Date(req.body.endDate) })
      }
    });

    res.json({
      success: true,
      message: 'Promotion updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// Delete promotion (Admin only)
exports.deletePromotion = async (req, res, next) => {
  try {
    await prisma.promotion.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Promotion deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
