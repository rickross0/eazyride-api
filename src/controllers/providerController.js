// ============================================================
// Provider (Car Rental) Controller — v3.0.0
// ============================================================

const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { paginate, paginationResponse } = require('../utils/helpers');

exports.getProviders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category } = req.query;
    const { skip, take, page: p, limit: l } = paginate(page, limit);
    const where = { isApproved: true };
    if (category) where.category = category;
    const [providers, total] = await Promise.all([
      prisma.providerProfile.findMany({ where, skip, take: l, orderBy: { rating: 'desc' }, include: { user: { select: { firstName: true, lastName: true, phone: true } }, _count: { select: { cars: true } } } }),
      prisma.providerProfile.count({ where }),
    ]);
    res.json({ success: true, ...paginationResponse(providers, total, p, l) });
  } catch (error) { next(error); }
};

exports.getProviderById = async (req, res, next) => {
  try {
    const provider = await prisma.providerProfile.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { firstName: true, lastName: true, phone: true, avatar: true } }, cars: { where: { isAvailable: true } } },
    });
    if (!provider) throw new AppError('Provider not found', 404);
    res.json({ success: true, data: provider });
  } catch (error) { next(error); }
};

exports.getMyProviderProfile = async (req, res, next) => {
  try {
    const provider = await prisma.providerProfile.findUnique({ where: { userId: req.user.id }, include: { cars: true } });
    if (!provider) throw new AppError('Provider profile not found', 404);
    res.json({ success: true, data: provider });
  } catch (error) { next(error); }
};

exports.updateProviderProfile = async (req, res, next) => {
  try {
    const provider = await prisma.providerProfile.update({ where: { userId: req.user.id }, data: req.body });
    res.json({ success: true, data: provider });
  } catch (error) { next(error); }
};

exports.toggleAvailability = async (req, res, next) => {
  try {
    const provider = await prisma.providerProfile.findUnique({ where: { userId: req.user.id } });
    if (!provider) throw new AppError('Provider not found', 404);
    const updated = await prisma.providerProfile.update({ where: { userId: req.user.id }, data: { isAvailable: !provider.isAvailable } });
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
};

// Admin
exports.approveProvider = async (req, res, next) => {
  try {
    const provider = await prisma.providerProfile.update({ where: { id: req.params.id }, data: { isApproved: true, approvedAt: new Date() } });
    res.json({ success: true, data: provider });
  } catch (error) { next(error); }
};

exports.getAllProvidersAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { skip, take, page: p, limit: l } = paginate(page, limit);
    const [providers, total] = await Promise.all([
      prisma.providerProfile.findMany({ skip, take: l, orderBy: { createdAt: 'desc' }, include: { user: { select: { firstName: true, lastName: true, phone: true } } } }),
      prisma.providerProfile.count(),
    ]);
    res.json({ success: true, ...paginationResponse(providers, total, p, l) });
  } catch (error) { next(error); }
};

exports.updateProviderCommission = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { commissionRate } = req.body;
    if (commissionRate === undefined) throw new AppError('Commission rate is required', 400);
    
    const updated = await prisma.providerProfile.update({
      where: { id },
      data: { commissionRate: Number(commissionRate) },
    });
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
};
