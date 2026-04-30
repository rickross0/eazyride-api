// ============================================================
// Promotions Service — v3.0.0
// ============================================================

const { prisma } = require('../config/database');
const logger = require('../utils/logger');

// Get active promotions for a target role
const getActivePromotions = async (targetRole = null) => {
  const now = new Date();
  const where = {
    isActive: true,
    startDate: { lte: now },
    endDate: { gte: now },
  };
  if (targetRole) {
    where.OR = [{ targetRole }, { targetRole: null }];
  }
  return prisma.promotion.findMany({ where, orderBy: { displayOrder: 'asc' } });
};

// Create promotion
const createPromotion = async (data) => {
  const promotion = await prisma.promotion.create({ data });
  logger.info(`Promotion created: ${promotion.title}`);
  return promotion;
};

// Update promotion
const updatePromotion = async (id, data) => {
  const promotion = await prisma.promotion.update({
    where: { id },
    data: {
      ...data,
      ...(data.startDate && { startDate: new Date(data.startDate) }),
      ...(data.endDate && { endDate: new Date(data.endDate) }),
    },
  });
  return promotion;
};

// Delete promotion
const deletePromotion = async (id) => {
  await prisma.promotion.delete({ where: { id } });
  logger.info(`Promotion deleted: ${id}`);
};

module.exports = { getActivePromotions, createPromotion, updatePromotion, deletePromotion };
