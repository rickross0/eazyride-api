// ============================================================
// Menu Controller — v3.0.0
// ============================================================

const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

function getImageUrl(req) {
  if (req.file) {
    const host = req.get('host');
    return `${req.protocol}://${host}/uploads/${req.file.filename}`;
  }
  return null;
}

exports.getMenuItems = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const items = await prisma.menuItem.findMany({
      where: { storeId, isAvailable: true },
      orderBy: { sortOrder: 'asc' },
      include: { category: true },
    });
    res.json({ success: true, data: items });
  } catch (error) { next(error); }
};

exports.getMenuItemById = async (req, res, next) => {
  try {
    const item = await prisma.menuItem.findUnique({ where: { id: req.params.id }, include: { category: true } });
    if (!item) throw new AppError('Menu item not found', 404);
    res.json({ success: true, data: item });
  } catch (error) { next(error); }
};

exports.createMenuItem = async (req, res, next) => {
  try {
    const imageUrl = getImageUrl(req);
    const data = { ...req.body };
    if (imageUrl) data.imageUrl = imageUrl;
    else if (req.body.imageUrl !== undefined) data.imageUrl = req.body.imageUrl || null;
    const item = await prisma.menuItem.create({ data });
    res.status(201).json({ success: true, data: item });
  } catch (error) { next(error); }
};

exports.updateMenuItem = async (req, res, next) => {
  try {
    const imageUrl = getImageUrl(req);
    const data = { ...req.body };
    if (imageUrl) data.imageUrl = imageUrl;
    else if (req.body.imageUrl !== undefined) data.imageUrl = req.body.imageUrl || null;
    const item = await prisma.menuItem.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: item });
  } catch (error) { next(error); }
};

exports.deleteMenuItem = async (req, res, next) => {
  try {
    await prisma.menuItem.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Item deleted' });
  } catch (error) { next(error); }
};

exports.toggleMenuAvailability = async (req, res, next) => {
  try {
    const item = await prisma.menuItem.findUnique({ where: { id: req.params.id } });
    if (!item) throw new AppError('Item not found', 404);
    const updated = await prisma.menuItem.update({ where: { id: req.params.id }, data: { isAvailable: !item.isAvailable } });
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
};

// Categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.storeCategory.findMany({
      where: { storeId: req.params.storeId },
      orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, data: categories });
  } catch (error) { next(error); }
};

exports.createCategory = async (req, res, next) => {
  try {
    const category = await prisma.storeCategory.create({ data: { storeId: req.params.storeId, ...req.body } });
    res.status(201).json({ success: true, data: category });
  } catch (error) { next(error); }
};
