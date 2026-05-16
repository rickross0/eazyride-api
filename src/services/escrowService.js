// ============================================================
// Escrow Service — v3.0.0
// ============================================================

const { prisma } = require('../config/database');
const logger = require('../utils/logger');

// Create escrow hold for car rental
const createEscrow = async ({ bookingId, providerId, amount }) => {
  try {
    const escrow = await prisma.escrow.create({
      data: {
        bookingId,
        amount,
        providerId,
        status: 'HELD',
        releaseAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
      },
    });

    logger.info(`Escrow created: ${escrow.id} for booking ${bookingId}`);
    return escrow;
  } catch (error) {
    logger.error('Escrow creation failed:', error.message);
    throw error;
  }
};

// Release escrow to provider
const releaseEscrow = async (escrowId) => {
  try {
    const escrow = await prisma.escrow.findUnique({ where: { id: escrowId } });
    if (!escrow) throw new Error('Escrow not found');
    if (escrow.status !== 'HELD') throw new Error('Escrow is not in HELD status');

    const updated = await prisma.escrow.update({
      where: { id: escrowId },
      data: { status: 'RELEASED', releasedAt: new Date() },
    });

    // Credit provider wallet
    await prisma.wallet.update({
      where: { userId: escrow.providerId },
      data: { balance: { increment: escrow.amount } },
    });

    logger.info(`Escrow released: ${escrowId}`);
    return updated;
  } catch (error) {
    logger.error('Escrow release failed:', error.message);
    throw error;
  }
};

// Refund escrow to rider
const refundEscrow = async (escrowId) => {
  try {
    const escrow = await prisma.escrow.findUnique({
      where: { id: escrowId },
      include: { booking: true },
    });
    if (!escrow) throw new Error('Escrow not found');
    if (escrow.status !== 'HELD') throw new Error('Escrow is not in HELD status');

    const updated = await prisma.escrow.update({
      where: { id: escrowId },
      data: { status: 'REFUNDED', refundedAt: new Date() },
    });

    // Refund to rider wallet
    await prisma.wallet.update({
      where: { userId: escrow.booking.riderId },
      data: { balance: { increment: escrow.amount } },
    });

    logger.info(`Escrow refunded: ${escrowId}`);
    return updated;
  } catch (error) {
    logger.error('Escrow refund failed:', error.message);
    throw error;
  }
};

module.exports = { createEscrow, releaseEscrow, refundEscrow };
