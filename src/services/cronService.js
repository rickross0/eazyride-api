// ============================================================
// Cron Service — Scheduled Tasks — v3.0.0
// ============================================================

const cron = require('node-cron');
const { prisma } = require('../config/database');
const { refundEscrow } = require('./escrowService');
const logger = require('../utils/logger');

const initializeCronJobs = () => {
  // Every 5 minutes: expire old ride requests
  cron.schedule('*/5 * * * *', async () => {
    try {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      const result = await prisma.ride.updateMany({
        where: { status: 'REQUESTED', createdAt: { lt: fiveMinAgo } },
        data: { status: 'CANCELLED', cancelReason: 'No driver available' },
      });
      if (result.count > 0) {
        logger.info(`Expired ${result.count} ride requests`);
      }
    } catch (error) {
      logger.error('Cron: expire rides error:', error.message);
    }
  });

  // Every 15 minutes: check escrow timeouts
  cron.schedule('*/15 * * * *', async () => {
    try {
      const expiredEscrows = await prisma.escrow.findMany({
        where: {
          status: 'HELD',
          releaseAt: { lte: new Date() },
        },
      });
      for (const escrow of expiredEscrows) {
        try {
          await releaseEscrow(escrow.id);
        } catch (e) {
          logger.error(`Escrow auto-release failed: ${escrow.id}`, e.message);
        }
      }
    } catch (error) {
      logger.error('Cron: escrow timeout error:', error.message);
    }
  });

  // Every hour: mark expired car rental bookings
  cron.schedule('0 * * * *', async () => {
    try {
      const result = await prisma.carRentalBooking.updateMany({
        where: {
          status: 'CONFIRMED',
          startDate: { lt: new Date() },
        },
        data: { status: 'EXPIRED' },
      });
      if (result.count > 0) {
        logger.info(`Expired ${result.count} rental bookings`);
      }
    } catch (error) {
      logger.error('Cron: expire bookings error:', error.message);
    }
  });

  // Daily at midnight: clean up old notifications
  cron.schedule('0 0 * * *', async () => {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const result = await prisma.notification.deleteMany({
        where: { createdAt: { lt: thirtyDaysAgo }, isRead: true },
      });
      if (result.count > 0) {
        logger.info(`Cleaned ${result.count} old notifications`);
      }
    } catch (error) {
      logger.error('Cron: cleanup notifications error:', error.message);
    }
  });

  // Every 10 minutes: update lottery statuses
  cron.schedule('*/10 * * * *', async () => {
    try {
      const now = new Date();
      // Start upcoming lotteries
      await prisma.lottery.updateMany({
        where: { status: 'UPCOMING', startDate: { lte: now } },
        data: { status: 'ACTIVE' },
      });
      // End expired lotteries
      await prisma.lottery.updateMany({
        where: { status: 'ACTIVE', endDate: { lt: now } },
        data: { status: 'CANCELLED' },
      });
    } catch (error) {
      logger.error('Cron: lottery status update error:', error.message);
    }
  });

  logger.info('✅ Cron jobs initialized');
};

// Helper: release escrow (used by cron)
const releaseEscrow = async (escrowId) => {
  const escrow = await prisma.escrow.findUnique({
    where: { id: escrowId },
    include: { booking: true },
  });
  if (!escrow) return;

  await prisma.escrow.update({
    where: { id: escrowId },
    data: { status: 'RELEASED', releasedAt: new Date() },
  });

  await prisma.wallet.update({
    where: { userId: escrow.providerId },
    data: { balance: { increment: escrow.amount } },
  });
};

module.exports = { initializeCronJobs };
