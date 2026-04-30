// ============================================================
// Lottery Service — v3.0.0
// ============================================================

const { prisma } = require('../config/database');
const { generateTicketNumber } = require('../utils/helpers');
const logger = require('../utils/logger');

// Get or create active lottery
const getActiveLottery = async () => {
  return prisma.lottery.findFirst({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { tickets: true } } },
  });
};

// Buy tickets
const buyTickets = async ({ lotteryId, userId, quantity = 1 }) => {
  return await prisma.$transaction(async (tx) => {
    const lottery = await tx.lottery.findUnique({ where: { id: lotteryId } });
    if (!lottery) throw new Error('Lottery not found');
    if (lottery.status !== 'ACTIVE') throw new Error('Lottery is not active');
    if (lottery.soldTickets + quantity > lottery.maxTickets) throw new Error('Not enough tickets');

    const totalPrice = lottery.ticketPrice * quantity;
    const wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet || wallet.balance < totalPrice) throw new Error('Insufficient balance');

    const tickets = [];
    let count = lottery.soldTickets;
    for (let i = 0; i < quantity; i++) {
      count++;
      tickets.push({
        lotteryId,
        userId,
        ticketNumber: generateTicketNumber(lotteryId, count),
        totalPrice: lottery.ticketPrice,
      });
    }

    await tx.lotteryTicket.createMany({ data: tickets });
    await tx.wallet.update({ where: { userId }, data: { balance: { decrement: totalPrice } } });
    await tx.lottery.update({
      where: { id: lotteryId },
      data: { soldTickets: { increment: quantity } },
    });
    await tx.transaction.create({
      data: {
        walletId: wallet.id, userId, type: 'LOTTERY_TICKET', amount: -totalPrice,
        balanceAfter: wallet.balance - totalPrice,
        description: `${quantity}x lottery ticket: ${lottery.title}`,
        referenceId: lotteryId, referenceType: 'LOTTERY',
      },
    });

    logger.info(`User ${userId} bought ${quantity} lottery tickets`);
    return { tickets, totalPrice };
  });
};

// Draw winner
const drawWinner = async (lotteryId) => {
  return await prisma.$transaction(async (tx) => {
    const lottery = await tx.lottery.findUnique({
      where: { id: lotteryId },
      include: { tickets: true },
    });

    if (!lottery) throw new Error('Lottery not found');
    if (lottery.tickets.length === 0) throw new Error('No tickets sold');

    await tx.lottery.update({ where: { id: lotteryId }, data: { status: 'DRAWING' } });

    const winningIndex = Math.floor(Math.random() * lottery.tickets.length);
    const winningTicket = lottery.tickets[winningIndex];

    await tx.lotteryTicket.update({
      where: { id: winningTicket.id },
      data: { isWinner: true },
    });

    const winnerWallet = await tx.wallet.findUnique({ where: { userId: winningTicket.userId } });
    if (winnerWallet) {
      await tx.wallet.update({
        where: { userId: winningTicket.userId },
        data: { balance: { increment: lottery.prizePool } },
      });
      await tx.transaction.create({
        data: {
          walletId: winnerWallet.id, userId: winningTicket.userId, type: 'LOTTERY_WIN',
          amount: lottery.prizePool, balanceAfter: winnerWallet.balance + lottery.prizePool,
          description: `Lottery win: ${lottery.title}`,
          referenceId: lotteryId, referenceType: 'LOTTERY',
        },
      });
    }

    await tx.lottery.update({
      where: { id: lotteryId },
      data: { status: 'COMPLETED', winnerId: winningTicket.userId, winningTicket: winningTicket.ticketNumber },
    });

    logger.info(`Lottery ${lotteryId} drawn. Winner: ${winningTicket.userId}`);
    return { winningTicket: winningTicket.ticketNumber, winnerId: winningTicket.userId };
  });
};

module.exports = { getActiveLottery, buyTickets, drawWinner };
