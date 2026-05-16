// ============================================================
// Lottery Service — Promotional Giveaway for Drivers
// ============================================================

const { prisma } = require('../config/database');
const { generateTicketNumber } = require('../utils/helpers');
const logger = require('../utils/logger');

const getActiveLottery = async () => {
  return prisma.lottery.findFirst({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { entries: true } } },
  });
};

// Free entry for drivers
const enterLottery = async ({ lotteryId, userId }) => {
  return await prisma.$transaction(async (tx) => {
    const lottery = await tx.lottery.findUnique({
      where: { id: lotteryId },
      include: { _count: { select: { entries: true } } },
    });
    if (!lottery) throw new Error('Lottery not found');
    if (lottery.status !== 'ACTIVE') throw new Error('Lottery is not active');
    if (lottery.entryLimit && lottery._count.entries >= lottery.entryLimit) {
      throw new Error('Lottery entry limit reached');
    }

    const existing = await tx.lotteryEntry.findFirst({ where: { lotteryId, userId } });
    if (existing) throw new Error('Already entered');

    const entryNumber = generateTicketNumber(lotteryId, lottery._count.entries + 1);
    const entry = await tx.lotteryEntry.create({
      data: { lotteryId, userId, entryNumber },
    });

    await tx.lottery.update({
      where: { id: lotteryId },
      data: { entryCount: { increment: 1 } },
    });

    logger.info(`Driver ${userId} entered lottery ${lotteryId}`);
    return entry;
  });
};

// Draw winner (random driver entry)
const drawWinner = async (lotteryId) => {
  return await prisma.$transaction(async (tx) => {
    const lottery = await tx.lottery.findUnique({
      where: { id: lotteryId },
      include: { entries: { include: { user: true } } },
    });
    if (!lottery) throw new Error('Lottery not found');
    if (lottery.entries.length === 0) throw new Error('No entries yet');

    await tx.lottery.update({ where: { id: lotteryId }, data: { status: 'DRAWING' } });

    const winningIndex = Math.floor(Math.random() * lottery.entries.length);
    const winningEntry = lottery.entries[winningIndex];

    await tx.lotteryEntry.update({
      where: { id: winningEntry.id },
      data: { isWinner: true },
    });

    const winnerWallet = await tx.wallet.findUnique({ where: { userId: winningEntry.userId } });
    if (winnerWallet) {
      await tx.wallet.update({
        where: { userId: winningEntry.userId },
        data: { balance: { increment: lottery.prizePool } },
      });
      await tx.transaction.create({
        data: {
          walletId: winnerWallet.id,
          userId: winningEntry.userId,
          type: 'LOTTERY_WIN',
          amount: lottery.prizePool,
          balanceAfter: winnerWallet.balance + lottery.prizePool,
          description: `Lottery win: ${lottery.title}`,
          referenceId: lotteryId,
          referenceType: 'LOTTERY',
        },
      });
    }

    await tx.lottery.update({
      where: { id: lotteryId },
      data: { status: 'COMPLETED', winnerId: winningEntry.userId },
    });

    logger.info(`Lottery ${lotteryId} drawn. Winner: ${winningEntry.userId}`);
    return { winningEntry, prizePool: lottery.prizePool };
  });
};

module.exports = { getActiveLottery, enterLottery, drawWinner };
