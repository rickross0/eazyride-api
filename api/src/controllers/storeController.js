// ============================================================
// Store Controller — v3.0.0
// ============================================================

const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { paginate, paginationResponse } = require('../utils/helpers');

function getImageUrl(req) {
  if (req.file) {
    const host = req.get('host');
    return `${req.protocol}://${host}/uploads/${req.file.filename}`;
  }
  return null;
}

exports.getStores = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, isOpen } = req.query;
    const { skip, take, page: p, limit: l } = paginate(page, limit);
    const where = { isActive: true };
    if (category) where.category = category;
    if (isOpen !== undefined) where.isOpen = isOpen === 'true';
    const [stores, total] = await Promise.all([
      prisma.store.findMany({ where, skip, take: l, orderBy: { rating: 'desc' }, include: { _count: { select: { menuItems: true } } } }),
      prisma.store.count({ where }),
    ]);
    res.json({ success: true, ...paginationResponse(stores, total, p, l) });
  } catch (error) { next(error); }
};

exports.getStoreById = async (req, res, next) => {
  try {
    const store = await prisma.store.findUnique({
      where: { id: req.params.id },
      include: { menuItems: { where: { isAvailable: true }, orderBy: { sortOrder: 'asc' } }, categories: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!store) throw new AppError('Store not found', 404);
    res.json({ success: true, data: store });
  } catch (error) { next(error); }
};

exports.getMyStore = async (req, res, next) => {
  try {
    const profile = await prisma.storeOwnerProfile.findUnique({ where: { userId: req.user.id }, include: { store: { include: { menuItems: true, categories: true } } } });
    if (!profile?.store) throw new AppError('No store found', 404);
    res.json({ success: true, data: profile.store });
  } catch (error) { next(error); }
};

exports.createStore = async (req, res, next) => {
  try {
    const data = { ...req.body };
    const imageUrl = getImageUrl(req);
    if (imageUrl) data.imageUrl = imageUrl;
    const store = await prisma.store.create({ data });
    res.status(201).json({ success: true, data: store });
  } catch (error) { next(error); }
};

exports.updateStore = async (req, res, next) => {
  try {
    const data = { ...req.body };
    const imageUrl = getImageUrl(req);
    if (imageUrl) data.imageUrl = imageUrl;
    else if (req.body.imageUrl !== undefined) data.imageUrl = req.body.imageUrl || null;
    const store = await prisma.store.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: store });
  } catch (error) { next(error); }
};

exports.toggleStoreOpen = async (req, res, next) => {
  try {
    const store = await prisma.store.findUnique({ where: { id: req.params.id } });
    if (!store) throw new AppError('Store not found', 404);
    const updated = await prisma.store.update({ where: { id: req.params.id }, data: { isOpen: !store.isOpen } });
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
};

exports.getAllStoresAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { skip, take, page: p, limit: l } = paginate(page, limit);
    const [stores, total] = await Promise.all([
      prisma.store.findMany({ skip, take: l, orderBy: { createdAt: 'desc' }, include: { owner: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } } } }),
      prisma.store.count(),
    ]);
    res.json({ success: true, ...paginationResponse(stores, total, p, l) });
  } catch (error) { next(error); }
};
