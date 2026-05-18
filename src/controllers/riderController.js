// ============================================================
// Rider Controller — v3.0.0
// ============================================================

const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { paginate, paginationResponse, flattenRide } = require('../utils/helpers');

exports.getRiderProfile = async (req, res, next) => {
  try {
    const profile = await prisma.riderProfile.findUnique({
      where: { userId: req.user.id },
      include: { user: { select: { id: true, firstName: true, lastName: true, phone: true, email: true, avatar: true } } },
    });
    if (!profile) throw new AppError('Rider profile not found', 404);
    res.json({ success: true, data: profile });
  } catch (error) { next(error); }
};

exports.updateRiderProfile = async (req, res, next) => {
  try {
    const { homeAddress, homeCoordinates, workAddress, workCoordinates, preferredPayment } = req.body;
    const profile = await prisma.riderProfile.upsert({
      where: { userId: req.user.id },
      update: { homeAddress, homeCoordinates, workAddress, workCoordinates, preferredPayment },
      create: { userId: req.user.id, homeAddress, homeCoordinates, workAddress, workCoordinates, preferredPayment },
    });
    res.json({ success: true, message: 'Profile updated', data: profile });
  } catch (error) { next(error); }
};

exports.getRideHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { skip, take, page: p, limit: l } = paginate(page, limit);
    const [rides, total] = await Promise.all([
      prisma.ride.findMany({ where: { riderId: req.user.id }, skip, take: l, orderBy: { createdAt: 'desc' }, include: { driver: { select: { id: true, firstName: true, lastName: true, avatar: true, driverProfile: true } } } }),
      prisma.ride.count({ where: { riderId: req.user.id } }),
    ]);
    res.json({ success: true, ...paginationResponse(rides.map(flattenRide), total, p, l) });
  } catch (error) { next(error); }
};

exports.getOrderHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { skip, take, page: p, limit: l } = paginate(page, limit);
    const [orders, total] = await Promise.all([
      prisma.order.findMany({ where: { riderId: req.user.id }, skip, take: l, orderBy: { createdAt: 'desc' }, include: { store: true, items: { include: { menuItem: true } } } }),
      prisma.order.count({ where: { riderId: req.user.id } }),
    ]);
    res.json({ success: true, ...paginationResponse(orders, total, p, l) });
  } catch (error) { next(error); }
};

exports.getRentalHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { skip, take, page: p, limit: l } = paginate(page, limit);
    const [bookings, total] = await Promise.all([
      prisma.carRentalBooking.findMany({ where: { riderId: req.user.id }, skip, take: l, orderBy: { createdAt: 'desc' }, include: { car: true } }),
      prisma.carRentalBooking.count({ where: { riderId: req.user.id } }),
    ]);
    res.json({ success: true, ...paginationResponse(bookings, total, p, l) });
  } catch (error) { next(error); }
};

exports.updateFCMToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    await prisma.user.update({ where: { id: req.user.id }, data: { fcmToken } });
    res.json({ success: true, message: 'FCM token updated' });
  } catch (error) { next(error); }
};
