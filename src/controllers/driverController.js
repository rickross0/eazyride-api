// ============================================================
// Driver Controller — v3.0.0
// ============================================================

const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { paginate, paginationResponse, flattenRide } = require('../utils/helpers');

exports.getOnlineDrivers = async (req, res, next) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;
    const drivers = await prisma.driverProfile.findMany({
      where: { isOnline: true, status: 'APPROVED' },
      include: { user: { select: { id: true, firstName: true, lastName: true, phone: true, avatar: true } } },
    });
    res.json({ success: true, data: drivers });
  } catch (error) { next(error); }
};

exports.updateLocation = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    await prisma.driverProfile.update({
      where: { userId: req.user.id },
      data: { currentLocation: { lat, lng } },
    });
    res.json({ success: true, message: 'Location updated' });
  } catch (error) { next(error); }
};

exports.toggleOnline = async (req, res, next) => {
  try {
    const { isOnline } = req.body;
    const profile = await prisma.driverProfile.update({
      where: { userId: req.user.id },
      data: { isOnline },
      include: { user: { select: { id: true, firstName: true } } },
    });
    res.json({ success: true, data: { isOnline: profile.isOnline } });
  } catch (error) { next(error); }
};

exports.getDriverProfile = async (req, res, next) => {
  try {
    const profile = await prisma.driverProfile.findUnique({
      where: { userId: req.user.id },
      include: { user: { select: { id: true, firstName: true, lastName: true, phone: true, email: true, avatar: true } } },
    });
    if (!profile) throw new AppError('Driver profile not found', 404);
    res.json({ success: true, data: profile });
  } catch (error) { next(error); }
};

exports.updateDriverProfile = async (req, res, next) => {
  try {
    const body = req.body;
    const updateData = {};

    if (body.vehicleType !== undefined) updateData.vehicleType = body.vehicleType;
    if (body.licenseNumber !== undefined) updateData.licenseNumber = body.licenseNumber;
    if (body.canDeliver !== undefined) updateData.canDeliver = body.canDeliver;
    if (body.isOnline !== undefined) updateData.isOnline = body.isOnline;
    if (body.currentLocation !== undefined) updateData.currentLocation = body.currentLocation;
    if (body.bankName !== undefined) updateData.bankName = body.bankName;
    if (body.bankAccountNumber !== undefined) updateData.bankAccountNumber = body.bankAccountNumber;
    if (body.bankAccountName !== undefined) updateData.bankAccountName = body.bankAccountName;

    // Map frontend field names to schema field names
    if (body.plateNumber !== undefined) updateData.vehiclePlate = body.plateNumber;
    if (body.vehiclePlate !== undefined) updateData.vehiclePlate = body.vehiclePlate;

    // Handle document upload (vehicle photo, license, etc.)
    if (req.file) {
      const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
      const docUrl = `${baseUrl}/uploads/${req.file.filename}`;
      const docType = body.type || 'document';
      const existing = await prisma.driverProfile.findUnique({ where: { userId: req.user.id }, select: { documents: true } });
      const docs = existing?.documents || {};
      docs[docType] = docUrl;
      updateData.documents = docs;
    }

    const profile = await prisma.driverProfile.update({
      where: { userId: req.user.id },
      data: updateData,
    });
    res.json({ success: true, message: 'Profile updated', data: profile });
  } catch (error) { next(error); }
};

exports.getDriverEarnings = async (req, res, next) => {
  try {
    const { period = 'week' } = req.query;
    const now = new Date();
    let startDate;
    if (period === 'day') startDate = new Date(now.setDate(now.getDate() - 1));
    else if (period === 'week') startDate = new Date(now.setDate(now.getDate() - 7));
    else if (period === 'month') startDate = new Date(now.setMonth(now.getMonth() - 1));
    else startDate = new Date(now.setDate(now.getDate() - 7));

    const earnings = await prisma.ride.findMany({
      where: { driverId: req.user.id, status: 'COMPLETED', completedAt: { gte: startDate } },
      select: { id: true, totalFare: true, driverEarnings: true, commissionAmount: true, completedAt: true },
    });
    const totalEarnings = earnings.reduce((sum, r) => sum + (r.driverEarnings || 0), 0);
    res.json({ success: true, data: { earnings, totalEarnings: totalEarnings.toFixed(2) } });
  } catch (error) { next(error); }
};

// Admin endpoints
exports.approveDriver = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await prisma.driverProfile.update({
      where: { id },
      data: { status: 'APPROVED', approvedAt: new Date(), approvedBy: req.user.id },
    });
    res.json({ success: true, message: 'Driver approved', data: profile });
  } catch (error) { next(error); }
};

exports.rejectDriver = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await prisma.driverProfile.update({ where: { id }, data: { status: 'REJECTED' } });
    res.json({ success: true, message: 'Driver rejected', data: profile });
  } catch (error) { next(error); }
};

exports.suspendDriver = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await prisma.driverProfile.update({ where: { id }, data: { status: 'SUSPENDED' } });
    res.json({ success: true, message: 'Driver suspended', data: profile });
  } catch (error) { next(error); }
};

exports.getAllDrivers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const { skip, take, page: p, limit: l } = paginate(page, limit);
    const where = {};
    if (status) where.status = status;
    const [drivers, total] = await Promise.all([
      prisma.driverProfile.findMany({ where, skip, take: l, orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, firstName: true, lastName: true, phone: true, avatar: true, isActive: true } } } }),
      prisma.driverProfile.count({ where }),
    ]);
    res.json({ success: true, ...paginationResponse(drivers, total, p, l) });
  } catch (error) { next(error); }
};

exports.getDriverRides = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const { skip, take, page: p, limit: l } = paginate(page, limit);
    const where = { driverId: req.user.id };
    if (status) where.status = status;
    const [rides, total] = await Promise.all([
      prisma.ride.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: l,
        include: {
          rider: { select: { id: true, firstName: true, lastName: true, phone: true } },
        },
      }),
      prisma.ride.count({ where }),
    ]);
    res.json({ success: true, ...paginationResponse(rides.map(flattenRide), total, p, l) });
  } catch (error) { next(error); }
};

exports.getDriverOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const { skip, take, page: p, limit: l } = paginate(page, limit);
    // Order.driverId references User.id, not DriverProfile.id
    const where = { driverId: req.user.id };
    if (status) where.status = status;
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: l,
        include: {
          items: true,
          store: { select: { id: true, name: true, imageUrl: true } },
          rider: { select: { id: true, firstName: true, phone: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);
    res.json({ success: true, ...paginationResponse(orders, total, p, l) });
  } catch (error) { next(error); }
};
