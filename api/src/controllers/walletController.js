// ============================================================
// Wallet Controller — v3.0.0
// ============================================================

const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { paginate, paginationResponse } = require('../utils/helpers');

exports.getWallet = async (req, res, next) => {
  try {
    const wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } });
    if (!wallet) {
      const newWallet = await prisma.wallet.create({ data: { userId: req.user.id, balance: 0 } });
      return res.json({ success: true, data: newWallet });
    }
    res.json({ success: true, data: wallet });
  } catch (error) { next(error); }
};

exports.getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const { skip, take, page: p, limit: l } = paginate(page, limit);
    const where = { userId: req.user.id };
    if (type) where.type = type;
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({ where, skip, take: l, orderBy: { createdAt: 'desc' } }),
      prisma.transaction.count({ where }),
    ]);
    res.json({ success: true, ...paginationResponse(transactions, total, p, l) });
  } catch (error) { next(error); }
};

exports.requestPayout = async (req, res, next) => {
  try {
    const { amount, method, bankName, accountNumber, accountName, phone } = req.body;
    const wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } });
    if (!wallet || wallet.balance < amount) throw new AppError('Insufficient balance', 400);
    
    // Create payout record
    const payout = await prisma.payout.create({
      data: { userId: req.user.id, amount, method, bankName, accountNumber, accountName, phone, status: 'PENDING' },
    });
    
    // Deduct from wallet
    await prisma.wallet.update({
      where: { userId: req.user.id },
      data: { balance: { decrement: amount } },
    });
    
    // Create transaction record
    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        userId: req.user.id,
        type: 'WITHDRAWAL',
        amount,
        balanceAfter: wallet.balance - amount,
        description: `Payout request via ${method}`,
        referenceId: payout.id,
        referenceType: 'PAYOUT',
      },
    });
    
    res.status(201).json({ success: true, data: payout });
  } catch (error) { next(error); }
};

// Admin payout endpoints
exports.getPayouts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const { skip, take, page: p, limit: l } = paginate(page, limit);
    const where = {};
    if (status) where.status = status;
    const [payouts, total] = await Promise.all([
      prisma.payout.findMany({ where, skip, take: l, orderBy: { createdAt: 'desc' }, include: { user: { select: { firstName: true, lastName: true, phone: true, role: true } } } }),
      prisma.payout.count({ where }),
    ]);
    res.json({ success: true, ...paginationResponse(payouts, total, p, l) });
  } catch (error) { next(error); }
};

exports.approvePayout = async (req, res, next) => {
  try {
    const payout = await prisma.payout.update({
      where: { id: req.params.id },
      data: { status: 'APPROVED', approvedBy: req.user.id, approvedAt: new Date() },
    });
    res.json({ success: true, data: payout });
  } catch (error) { next(error); }
};

exports.completePayout = async (req, res, next) => {
  try {
    const payout = await prisma.payout.update({
      where: { id: req.params.id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });
    // Note: wallet was already deducted at request time
    res.json({ success: true, data: payout });
  } catch (error) { next(error); }
};

// Get current user's payouts
exports.getMyPayouts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const { skip, take, page: p, limit: l } = paginate(page, limit);
    const where = { userId: req.user.id };
    if (status) where.status = status;
    const [payouts, total] = await Promise.all([
      prisma.payout.findMany({ where, skip, take: l, orderBy: { createdAt: 'desc' } }),
      prisma.payout.count({ where }),
    ]);
    res.json({ success: true, ...paginationResponse(payouts, total, p, l) });
  } catch (error) { next(error); }
};
