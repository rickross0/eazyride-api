// ============================================================
// User Controller — v3.0.0
// ============================================================

const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { paginate, paginationResponse } = require('../utils/helpers');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { riderProfile: true, driverProfile: true, storeOwnerProfile: { include: { store: true } }, providerProfile: true, adminProfile: true, wallet: true },
    });
    if (!user) throw new AppError('User not found', 404);
    const { password, ...data } = user;
    res.json({ success: true, data });
  } catch (error) { next(error); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email, avatar } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { ...(firstName && { firstName }), ...(lastName && { lastName }), ...(email && { email }), ...(avatar && { avatar }) },
    });
    const { password, ...data } = user;
    res.json({ success: true, message: 'Profile updated', data });
  } catch (error) { next(error); }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, firstName: true, lastName: true, phone: true, avatar: true, role: true, isActive: true, createdAt: true },
    });
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: user });
  } catch (error) { next(error); }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const { skip, take, page: p, limit: l } = paginate(page, limit);
    const where = {};
    if (role) where.role = role;
    if (search) where.OR = [{ firstName: { contains: search } }, { lastName: { contains: search } }, { phone: { contains: search } }];
    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take: l, orderBy: { createdAt: 'desc' }, select: { id: true, firstName: true, lastName: true, phone: true, role: true, isActive: true, createdAt: true } }),
      prisma.user.count({ where }),
    ]);
    res.json({ success: true, ...paginationResponse(users, total, p, l) });
  } catch (error) { next(error); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) { next(error); }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) throw new AppError('User not found', 404);
    const updated = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: !user.isActive } });
    res.json({ success: true, message: `User ${updated.isActive ? 'activated' : 'deactivated'}`, data: { id: updated.id, isActive: updated.isActive } });
  } catch (error) { next(error); }
};

exports.getSavedAddresses = async (req, res, next) => {
  try {
    const addresses = await prisma.savedAddress.findMany({ where: { userId: req.user.id }, orderBy: { isDefault: 'desc' } });
    res.json({ success: true, data: addresses });
  } catch (error) { next(error); }
};

exports.addSavedAddress = async (req, res, next) => {
  try {
    const { label, address, coordinates, isDefault } = req.body;
    if (isDefault) await prisma.savedAddress.updateMany({ where: { userId: req.user.id, isDefault: true }, data: { isDefault: false } });
    const savedAddress = await prisma.savedAddress.create({ data: { userId: req.user.id, label, address, coordinates, isDefault: isDefault || false } });
    res.status(201).json({ success: true, data: savedAddress });
  } catch (error) { next(error); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) throw new AppError('Password must be at least 6 characters', 400);
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id }, data: { password: hashed } });
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!role) throw new AppError('Role is required', 400);
    const updated = await prisma.user.update({ where: { id }, data: { role } });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteSavedAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.savedAddress.deleteMany({ where: { id, userId: req.user.id } });
    res.json({ success: true, message: 'Address deleted' });
  } catch (err) {
    next(err);
  }
};
