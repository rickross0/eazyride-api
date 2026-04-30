// ============================================================
// Admin Controller — v3.0.0
// ============================================================

const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { paginate, paginationResponse } = require('../utils/helpers');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalRides, totalOrders, totalBookings, activeDrivers, totalRevenue] = await Promise.all([
      prisma.user.count(),
      prisma.ride.count(),
      prisma.order.count(),
      prisma.carRentalBooking.count(),
      prisma.driverProfile.count({ where: { isOnline: true, status: 'APPROVED' } }),
      prisma.transaction.aggregate({ where: { type: 'PAYMENT', status: 'COMPLETED' }, _sum: { amount: true } }),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [todayRides, todayOrders, todayBookings, todayRevenue] = await Promise.all([
      prisma.ride.count({ where: { createdAt: { gte: today } } }),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.carRentalBooking.count({ where: { createdAt: { gte: today } } }),
      prisma.transaction.aggregate({ where: { type: 'PAYMENT', status: 'COMPLETED', createdAt: { gte: today } }, _sum: { amount: true } }),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers, totalRides, totalOrders, totalBookings, activeDrivers,
        totalRevenue: totalRevenue._sum.amount || 0,
        today: { rides: todayRides, orders: todayOrders, bookings: todayBookings, revenue: todayRevenue._sum.amount || 0 },
      },
    });
  } catch (error) { next(error); }
};

exports.getRecentActivity = async (req, res, next) => {
  try {
    const [recentRides, recentOrders, recentBookings] = await Promise.all([
      prisma.ride.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { rider: { select: { firstName: true, lastName: true } }, driver: { select: { firstName: true, lastName: true } } } }),
      prisma.order.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { store: { select: { name: true } }, rider: { select: { firstName: true, lastName: true } } } }),
      prisma.carRentalBooking.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { car: { select: { make: true, model: true } }, rider: { select: { firstName: true, lastName: true } } } }),
    ]);
    res.json({ success: true, data: { recentRides, recentOrders, recentBookings } });
  } catch (error) { next(error); }
};

// Promo Codes
exports.getPromoCodes = async (req, res, next) => {
  try {
    const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: promos });
  } catch (error) { next(error); }
};

exports.createPromoCode = async (req, res, next) => {
  try {
    const promo = await prisma.promoCode.create({ data: req.body });
    res.status(201).json({ success: true, data: promo });
  } catch (error) { next(error); }
};

exports.deletePromoCode = async (req, res, next) => {
  try {
    await prisma.promoCode.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Promo code deleted' });
  } catch (error) { next(error); }
};

// Fare Settings
exports.getFareSettings = async (req, res, next) => {
  try {
    const settings = await prisma.fareSetting.findMany({ orderBy: { vehicleType: 'asc' } });
    res.json({ success: true, data: settings });
  } catch (error) { next(error); }
};

exports.updateFareSetting = async (req, res, next) => {
  try {
    const setting = await prisma.fareSetting.upsert({
      where: { vehicleType: req.params.vehicleType },
      update: req.body,
      create: { vehicleType: req.params.vehicleType, ...req.body },
    });
    res.json({ success: true, data: setting });
  } catch (error) { next(error); }
};

// Surge Zones
exports.getSurgeZones = async (req, res, next) => {
  try {
    const zones = await prisma.surgeZone.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: zones });
  } catch (error) { next(error); }
};

exports.createSurgeZone = async (req, res, next) => {
  try {
    const zone = await prisma.surgeZone.create({ data: req.body });
    res.status(201).json({ success: true, data: zone });
  } catch (error) { next(error); }
};

exports.deleteSurgeZone = async (req, res, next) => {
  try {
    await prisma.surgeZone.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Surge zone deleted' });
  } catch (error) { next(error); }
};

// Feature Toggles
exports.getFeatureToggles = async (req, res, next) => {
  try {
    const toggles = await prisma.featureToggle.findMany({ orderBy: { key: 'asc' } });
    res.json({ success: true, data: toggles });
  } catch (error) { next(error); }
};

exports.updateFeatureToggle = async (req, res, next) => {
  try {
    const toggle = await prisma.featureToggle.upsert({
      where: { key: req.params.key },
      update: req.body,
      create: { key: req.params.key, ...req.body },
    });
    res.json({ success: true, data: toggle });
  } catch (error) { next(error); }
};

// Staff Management
exports.getStaff = async (req, res, next) => {
  try {
    const staff = await prisma.adminProfile.findMany({
      include: { user: { select: { id: true, firstName: true, lastName: true, phone: true, email: true, isActive: true } } },
    });
    res.json({ success: true, data: staff });
  } catch (error) { next(error); }
};

exports.createStaff = async (req, res, next) => {
  try {
    const { phone, password, firstName, lastName, adminRole } = req.body;
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { phone, password: hashedPassword, firstName, lastName, role: 'ADMIN', adminProfile: { create: { adminRole: adminRole || 'CARE' } }, wallet: { create: { balance: 0 } } },
    });
    res.status(201).json({ success: true, data: { id: user.id, firstName, lastName, phone } });
  } catch (error) { next(error); }
};

// Audit Log
exports.getAuditLog = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const { skip, take, page: p, limit: l } = paginate(page, limit);
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({ skip, take: l, orderBy: { createdAt: 'desc' }, include: { user: { select: { firstName: true, lastName: true } } } }),
      prisma.auditLog.count(),
    ]);
    res.json({ success: true, ...paginationResponse(logs, total, p, l) });
  } catch (error) { next(error); }
};
