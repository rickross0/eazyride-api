// ============================================================
// 🎰 Lottery Controller
// ============================================================

const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { generateTicketNumber, paginationResponse, paginate } = require('../utils/helpers');
const logger = require('../utils/logger');
const { LOTTERY_STATUS } = require('../config/constants');

// Get all lotteries
exports.getLotteries = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query;
    const { skip, take, page: p, limit: l } = paginate(page, limit);

    const where = {};
    if (status) where.status = status;

    const [lotteries, total] = await Promise.all([
      prisma.lottery.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          winner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true
            }
          },
          _count: {
            select: { tickets: true }
          }
        }
      }),
      prisma.lottery.count({ where })
    ]);

    res.json({
      success: true,
      ...paginationResponse(lotteries, total, p, l)
    });
  } catch (error) {
    next(error);
  }
};

// Get active lottery
exports.getActiveLottery = async (req, res, next) => {
  try {
    const lottery = await prisma.lottery.findFirst({
      where: { status: 'ACTIVE' },
      include: {
        _count: {
          select: { tickets: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: lottery
    });
  } catch (error) {
    next(error);
  }
};

// Get lottery by ID
exports.getLotteryById = async (req, res, next) => {
  try {
    const lottery = await prisma.lottery.findUnique({
      where: { id: req.params.id },
      include: {
        winner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatar: true
          }
        },
        tickets: {
          take: 10,
          orderBy: { purchasedAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        _count: {
          select: { tickets: true }
        }
      }
    });

    if (!lottery) {
      throw new AppError('Lottery not found', 404);
    }

    res.json({
      success: true,
      data: lottery
    });
  } catch (error) {
    next(error);
  }
};

// Buy lottery ticket (Riders and Drivers only)
exports.buyTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity = 1 } = req.body;
    const userId = req.user.id;

    // Get lottery
    const lottery = await prisma.lottery.findUnique({
      where: { id }
    });

    if (!lottery) {
      throw new AppError('Lottery not found', 404);
    }

    // Check lottery is active
    if (lottery.status !== 'ACTIVE') {
      throw new AppError('Lottery is not active', 400);
    }

    // Check if still accepting tickets
    if (lottery.soldTickets + quantity > lottery.maxTickets) {
      throw new AppError('Not enough tickets available', 400);
    }

    // Check if lottery hasn't ended
    if (new Date() > lottery.endDate) {
      throw new AppError('Lottery has ended', 400);
    }

    // Calculate total price
    const totalPrice = lottery.ticketPrice * quantity;

    // Check user wallet balance
    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet || wallet.balance < totalPrice) {
      throw new AppError('Insufficient wallet balance', 400);
    }

    // Generate tickets
    const tickets = [];
    let currentCount = lottery.soldTickets;

    for (let i = 0; i < quantity; i++) {
      currentCount++;
      tickets.push({
        lotteryId: id,
        userId,
        ticketNumber: generateTicketNumber(id, currentCount),
        quantity: 1,
        totalPrice: lottery.ticketPrice,
        isWinner: false
      });
    }

    // Create tickets and update wallet in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tickets
      const createdTickets = await tx.lotteryTicket.createMany({
        data: tickets
      });

      // Update wallet balance
      await tx.wallet.update({
        where: { userId },
        data: {
          balance: { decrement: totalPrice }
        }
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          userId,
          type: 'LOTTERY_TICKET',
          amount: -totalPrice,
          balanceAfter: wallet.balance - totalPrice,
          description: `Lottery ticket purchase: ${quantity}x ${lottery.title}`,
          referenceId: id,
          referenceType: 'LOTTERY'
        }
      });

      // Update lottery sold count
      await tx.lottery.update({
        where: { id },
        data: {
          soldTickets: { increment: quantity }
        }
      });

      return createdTickets;
    });

    logger.info(`User ${userId} bought ${quantity} lottery tickets for lottery ${id}`);

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('lottery:ticketSold', {
        lotteryId: id,
        soldTickets: lottery.soldTickets + quantity
      });
    }

    res.status(201).json({
      success: true,
      message: `Successfully purchased ${quantity} ticket(s)`,
      data: {
        tickets,
        totalCost: totalPrice,
        newBalance: wallet.balance - totalPrice
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get my tickets
exports.getMyTickets = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { skip, take, page: p, limit: l } = paginate(page, limit);

    const where = { userId: req.user.id };

    const [tickets, total] = await Promise.all([
      prisma.lotteryTicket.findMany({
        where,
        skip,
        take,
        orderBy: { purchasedAt: 'desc' },
        include: {
          lottery: {
            select: {
              id: true,
              title: true,
              status: true,
              drawDate: true,
              prizePool: true
            }
          }
        }
      }),
      prisma.lotteryTicket.count({ where })
    ]);

    res.json({
      success: true,
      ...paginationResponse(tickets, total, p, l)
    });
  } catch (error) {
    next(error);
  }
};

// Get my lottery history
exports.getMyHistory = async (req, res, next) => {
  try {
    const tickets = await prisma.lotteryTicket.findMany({
      where: { userId: req.user.id, isWinner: true },
      orderBy: { purchasedAt: 'desc' },
      include: {
        lottery: {
          select: {
            id: true,
            title: true,
            prizePool: true,
            prizeDescription: true,
            drawDate: true
          }
        }
      }
    });

    const totalWinnings = tickets.reduce((sum, t) => sum + t.totalPrice, 0);

    res.json({
      success: true,
      data: {
        tickets,
        totalWinnings,
        totalWins: tickets.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create lottery (Admin only)
exports.createLottery = async (req, res, next) => {
  try {
    const {
      title,
      description,
      ticketPrice,
      maxTickets,
      prizePool,
      prizeDescription,
      prizeImageUrl,
      startDate,
      endDate,
      drawDate,
      termsAndConditions
    } = req.body;

    const lottery = await prisma.lottery.create({
      data: {
        title,
        description,
        ticketPrice,
        maxTickets,
        prizePool,
        prizeDescription,
        prizeImageUrl,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        drawDate: new Date(drawDate),
        termsAndConditions,
        status: 'UPCOMING'
      }
    });

    logger.info(`New lottery created: ${lottery.title}`);

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('lottery:new', lottery);
    }

    res.status(201).json({
      success: true,
      message: 'Lottery created successfully',
      data: lottery
    });
  } catch (error) {
    next(error);
  }
};

// Update lottery (Admin only)
exports.updateLottery = async (req, res, next) => {
  try {
    const lottery = await prisma.lottery.findUnique({
      where: { id: req.params.id }
    });

    if (!lottery) {
      throw new AppError('Lottery not found', 404);
    }

    if (lottery.status === 'COMPLETED' || lottery.status === 'DRAWING') {
      throw new AppError('Cannot update completed or drawing lottery', 400);
    }

    const updated = await prisma.lottery.update({
      where: { id: req.params.id },
      data: req.body
    });

    res.json({
      success: true,
      message: 'Lottery updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// Delete lottery (Admin only)
exports.deleteLottery = async (req, res, next) => {
  try {
    const lottery = await prisma.lottery.findUnique({
      where: { id: req.params.id },
      include: { tickets: true }
    });

    if (!lottery) {
      throw new AppError('Lottery not found', 404);
    }

    if (lottery.tickets.length > 0) {
      throw new AppError('Cannot delete lottery with sold tickets', 400);
    }

    await prisma.lottery.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Lottery deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Draw lottery (Admin only)
exports.drawLottery = async (req, res, next) => {
  try {
    const lottery = await prisma.lottery.findUnique({
      where: { id: req.params.id },
      include: {
        tickets: true
      }
    });

    if (!lottery) {
      throw new AppError('Lottery not found', 404);
    }

    if (lottery.status !== 'ACTIVE' && lottery.status !== 'UPCOMING') {
      throw new AppError('Lottery cannot be drawn', 400);
    }

    if (lottery.tickets.length === 0) {
      throw new AppError('No tickets sold', 400);
    }

    // Update status to DRAWING
    await prisma.lottery.update({
      where: { id: req.params.id },
      data: { status: 'DRAWING' }
    });

    // Random winner selection
    const winningIndex = Math.floor(Math.random() * lottery.tickets.length);
    const winningTicket = lottery.tickets[winningIndex];

    // Update lottery and ticket in transaction
    await prisma.$transaction(async (tx) => {
      // Mark winning ticket
      await tx.lotteryTicket.update({
        where: { id: winningTicket.id },
        data: { isWinner: true }
      });

      // Award prize to winner's wallet
      const winnerWallet = await tx.wallet.findUnique({
        where: { userId: winningTicket.userId }
      });

      if (winnerWallet) {
        await tx.wallet.update({
          where: { userId: winningTicket.userId },
          data: {
            balance: { increment: lottery.prizePool }
          }
        });

        // Create transaction record
        await tx.transaction.create({
          data: {
            walletId: winnerWallet.id,
            userId: winningTicket.userId,
            type: 'LOTTERY_WIN',
            amount: lottery.prizePool,
            balanceAfter: winnerWallet.balance + lottery.prizePool,
            description: `Lottery win: ${lottery.title}`,
            referenceId: lottery.id,
            referenceType: 'LOTTERY'
          }
        });
      }

      // Update lottery
      await tx.lottery.update({
        where: { id: lottery.id },
        data: {
          status: 'COMPLETED',
          winnerId: winningTicket.userId,
          winningTicket: winningTicket.ticketNumber
        }
      });
    });

    logger.info(`Lottery ${lottery.id} drawn. Winner: ${winningTicket.userId}, Ticket: ${winningTicket.ticketNumber}`);

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.emit('lottery:drawn', {
        lotteryId: lottery.id,
        winnerId: winningTicket.userId,
        winningTicket: winningTicket.ticketNumber,
        prizePool: lottery.prizePool
      });
    }

    // Get winner info for response
    const winner = await prisma.user.findUnique({
      where: { id: winningTicket.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true
      }
    });

    res.json({
      success: true,
      message: 'Lottery drawn successfully',
      data: {
        lotteryId: lottery.id,
        winningTicket: winningTicket.ticketNumber,
        winner,
        prizePool: lottery.prizePool
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get lottery stats (Admin only)
exports.getLotteryStats = async (req, res, next) => {
  try {
    const [
      totalLotteries,
      activeLotteries,
      totalTicketsSold,
      totalPrizesPaid,
      recentWinners
    ] = await Promise.all([
      prisma.lottery.count(),
      prisma.lottery.count({ where: { status: 'ACTIVE' } }),
      prisma.lotteryTicket.count(),
      prisma.transaction.aggregate({
        where: { type: 'LOTTERY_WIN' },
        _sum: { amount: true }
      }),
      prisma.lottery.findMany({
        where: { status: 'COMPLETED' },
        take: 5,
        orderBy: { drawDate: 'desc' },
        include: {
          winner: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalLotteries,
        activeLotteries,
        totalTicketsSold,
        totalPrizesPaid: totalPrizesPaid._sum.amount || 0,
        recentWinners
      }
    });
  } catch (error) {
    next(error);
  }
};
