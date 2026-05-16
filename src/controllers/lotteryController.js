// ============================================================
// 🎰 Lottery Controller — Promotional Giveaway for Drivers
// ============================================================

const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { generateTicketNumber, paginationResponse, paginate } = require('../utils/helpers');
const logger = require('../utils/logger');

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
            select: { id: true, firstName: true, lastName: true, phone: true }
          },
          _count: { select: { entries: true } }
        }
      }),
      prisma.lottery.count({ where })
    ]);

    res.json({ success: true, ...paginationResponse(lotteries, total, p, l) });
  } catch (error) { next(error); }
};

// Get active lottery
exports.getActiveLottery = async (req, res, next) => {
  try {
    const lottery = await prisma.lottery.findFirst({
      where: { status: 'ACTIVE' },
      include: { _count: { select: { entries: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: lottery });
  } catch (error) { next(error); }
};

// Get lottery by ID
exports.getLotteryById = async (req, res, next) => {
  try {
    const lottery = await prisma.lottery.findUnique({
      where: { id: req.params.id },
      include: {
        winner: {
          select: { id: true, firstName: true, lastName: true, phone: true, avatar: true }
        },
        entries: {
          take: 10,
          orderBy: { enteredAt: 'desc' },
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true }
            }
          }
        },
        _count: { select: { entries: true } }
      }
    });
    if (!lottery) throw new AppError('Lottery not found', 404);
    res.json({ success: true, data: lottery });
  } catch (error) { next(error); }
};

// Enter lottery (FREE — Drivers only)
exports.enterLottery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify user is a DRIVER
    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId },
      select: { id: true, status: true }
    });
    if (!driverProfile) throw new AppError('Only drivers can enter the lottery', 403);
    if (driverProfile.status !== 'APPROVED') throw new AppError('Driver must be approved to enter', 403);

    const lottery = await prisma.lottery.findUnique({
      where: { id },
      include: { _count: { select: { entries: true } } }
    });
    if (!lottery) throw new AppError('Lottery not found', 404);
    if (lottery.status !== 'ACTIVE') throw new AppError('Lottery is not active', 400);
    if (new Date() > lottery.endDate) throw new AppError('Lottery has ended', 400);

    // Check entry limit
    if (lottery.entryLimit && lottery._count.entries >= lottery.entryLimit) {
      throw new AppError('Lottery entry limit reached', 400);
    }

    // Check if user already entered
    const existing = await prisma.lotteryEntry.findFirst({
      where: { lotteryId: id, userId }
    });
    if (existing) throw new AppError('You have already entered this lottery', 400);

    const entryCount = lottery._count.entries;
    const entryNumber = generateTicketNumber(id, entryCount + 1);

    const entry = await prisma.lotteryEntry.create({
      data: {
        lotteryId: id,
        userId,
        entryNumber,
      },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    // Update lottery entry count
    await prisma.lottery.update({
      where: { id },
      data: { entryCount: { increment: 1 } }
    });

    logger.info(`Driver ${userId} entered lottery ${id}`);

    const io = req.app.get('io');
    if (io) io.emit('lottery:entry', { lotteryId: id, userId, entryCount: entryCount + 1 });

    res.status(201).json({
      success: true,
      message: 'Entry submitted successfully!',
      data: entry
    });
  } catch (error) { next(error); }
};

// Get my entries
exports.getMyEntries = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = { userId: req.user.id };
    if (status) where.lottery = { status };

    const entries = await prisma.lotteryEntry.findMany({
      where,
      orderBy: { enteredAt: 'desc' },
      include: {
        lottery: {
          select: { id: true, title: true, prizePool: true, status: true, drawDate: true, winnerId: true }
        }
      }
    });
    res.json({ success: true, data: entries });
  } catch (error) { next(error); }
};

// Get my history
exports.getMyHistory = async (req, res, next) => {
  try {
    const entries = await prisma.lotteryEntry.findMany({
      where: { userId: req.user.id },
      orderBy: { enteredAt: 'desc' },
      include: {
        lottery: {
          select: { id: true, title: true, prizePool: true, status: true, drawDate: true }
        }
      }
    });
    const won = entries.filter(e => e.isWinner);
    res.json({ success: true, data: { entries, won, totalEntered: entries.length, totalWon: won.length } });
  } catch (error) { next(error); }
};

// Create lottery (Admin only)
exports.createLottery = async (req, res, next) => {
  try {
    const { title, description, prizePool, prizeDescription, prizeImageUrl, entryLimit, startDate, endDate, drawDate, termsAndConditions } = req.body;

    if (!title || !prizePool || !startDate || !endDate || !drawDate) {
      throw new AppError('title, prizePool, startDate, endDate, drawDate required', 400);
    }

    const lottery = await prisma.lottery.create({
      data: {
        title,
        description: description || null,
        prizePool: parseFloat(prizePool),
        prizeDescription: prizeDescription || null,
        prizeImageUrl: prizeImageUrl || null,
        entryLimit: entryLimit ? parseInt(entryLimit) : null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        drawDate: new Date(drawDate),
        termsAndConditions: termsAndConditions || null,
        status: 'UPCOMING'
      }
    });

    logger.info(`New lottery created: ${lottery.title}`);
    const io = req.app.get('io');
    if (io) io.emit('lottery:new', lottery);

    res.status(201).json({ success: true, message: 'Lottery created', data: lottery });
  } catch (error) { next(error); }
};

// Update lottery (Admin only)
exports.updateLottery = async (req, res, next) => {
  try {
    const lottery = await prisma.lottery.findUnique({ where: { id: req.params.id } });
    if (!lottery) throw new AppError('Lottery not found', 404);
    if (['COMPLETED', 'DRAWING'].includes(lottery.status)) {
      throw new AppError('Cannot update completed or drawing lottery', 400);
    }
    const updated = await prisma.lottery.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, message: 'Lottery updated', data: updated });
  } catch (error) { next(error); }
};

// Delete lottery (Admin only)
exports.deleteLottery = async (req, res, next) => {
  try {
    const lottery = await prisma.lottery.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { entries: true } } }
    });
    if (!lottery) throw new AppError('Lottery not found', 404);
    if (lottery._count.entries > 0) {
      throw new AppError('Cannot delete lottery with entries', 400);
    }
    await prisma.lottery.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Lottery deleted' });
  } catch (error) { next(error); }
};

// Draw lottery (Admin only) — picks a random DRIVER entry
exports.drawLottery = async (req, res, next) => {
  try {
    const lottery = await prisma.lottery.findUnique({
      where: { id: req.params.id },
      include: {
        entries: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, phone: true } }
          }
        }
      }
    });

    if (!lottery) throw new AppError('Lottery not found', 404);
    if (!['ACTIVE', 'UPCOMING'].includes(lottery.status)) throw new AppError('Lottery cannot be drawn', 400);
    if (lottery.entries.length === 0) throw new AppError('No entries yet', 400);

    await prisma.lottery.update({ where: { id: req.params.id }, data: { status: 'DRAWING' } });

    const winningIndex = Math.floor(Math.random() * lottery.entries.length);
    const winningEntry = lottery.entries[winningIndex];

    await prisma.$transaction(async (tx) => {
      await tx.lotteryEntry.update({
        where: { id: winningEntry.id },
        data: { isWinner: true }
      });

      const winnerWallet = await tx.wallet.findUnique({ where: { userId: winningEntry.userId } });
      if (winnerWallet) {
        await tx.wallet.update({
          where: { userId: winningEntry.userId },
          data: { balance: { increment: lottery.prizePool } }
        });
        await tx.transaction.create({
          data: {
            walletId: winnerWallet.id,
            userId: winningEntry.userId,
            type: 'LOTTERY_WIN',
            amount: lottery.prizePool,
            balanceAfter: winnerWallet.balance + lottery.prizePool,
            description: `Lottery win: ${lottery.title}`,
            referenceId: lottery.id,
            referenceType: 'LOTTERY'
          }
        });
      }

      await tx.lottery.update({
        where: { id: lottery.id },
        data: { status: 'COMPLETED', winnerId: winningEntry.userId }
      });
    });

    logger.info(`Lottery ${lottery.id} drawn. Winner: ${winningEntry.userId}`);

    const io = req.app.get('io');
    if (io) {
      io.emit('lottery:drawn', {
        lotteryId: lottery.id,
        winnerId: winningEntry.userId,
        prizePool: lottery.prizePool
      });
    }

    res.json({
      success: true,
      message: 'Lottery drawn successfully',
      data: {
        lotteryId: lottery.id,
        winner: winningEntry.user,
        prizePool: lottery.prizePool
      }
    });
  } catch (error) { next(error); }
};

// Get lottery stats (Admin only)
exports.getLotteryStats = async (req, res, next) => {
  try {
    const [
      totalLotteries,
      activeLotteries,
      totalEntries,
      totalPrizesPaid,
      recentWinners
    ] = await Promise.all([
      prisma.lottery.count(),
      prisma.lottery.count({ where: { status: 'ACTIVE' } }),
      prisma.lotteryEntry.count(),
      prisma.transaction.aggregate({ where: { type: 'LOTTERY_WIN' }, _sum: { amount: true } }),
      prisma.lottery.findMany({
        where: { status: 'COMPLETED' },
        take: 5,
        orderBy: { drawDate: 'desc' },
        include: {
          winner: { select: { firstName: true, lastName: true } }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalLotteries,
        activeLotteries,
        totalEntries,
        totalPrizesPaid: totalPrizesPaid._sum.amount || 0,
        recentWinners
      }
    });
  } catch (error) { next(error); }
};
