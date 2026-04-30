// ============================================================
// Report & Analytics Controller — v3.0.0
// ============================================================

const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

exports.getRevenueReport = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;
    const now = new Date();
    let startDate;
    if (period === 'day') startDate = new Date(now.setDate(now.getDate() - 1));
    else if (period === 'week') startDate = new Date(now.setDate(now.getDate() - 7));
    else if (period === 'month') startDate = new Date(now.setMonth(now.getMonth() - 1));
    else startDate = new Date(now.setMonth(now.getMonth() - 1));

    const [rideRevenue, orderRevenue, rentalRevenue] = await Promise.all([
      prisma.ride.aggregate({ where: { status: 'COMPLETED', completedAt: { gte: startDate } }, _sum: { totalFare: true, commissionAmount: true } }),
      prisma.order.aggregate({ where: { status: 'DELIVERED', deliveredAt: { gte: startDate } }, _sum: { totalAmount: true, commissionAmount: true } }),
      prisma.carRentalBooking.aggregate({ where: { status: 'COMPLETED', completedAt: { gte: startDate } }, _sum: { totalAmount: true, commissionAmount: true } }),
    ]);

    res.json({
      success: true,
      data: {
        rides: { total: rideRevenue._sum.totalFare || 0, commission: rideRevenue._sum.commissionAmount || 0 },
        orders: { total: orderRevenue._sum.totalAmount || 0, commission: orderRevenue._sum.commissionAmount || 0 },
        rentals: { total: rentalRevenue._sum.totalAmount || 0, commission: rentalRevenue._sum.commissionAmount || 0 },
        total: (rideRevenue._sum.totalFare || 0) + (orderRevenue._sum.totalAmount || 0) + (rentalRevenue._sum.totalAmount || 0),
        totalCommission: (rideRevenue._sum.commissionAmount || 0) + (orderRevenue._sum.commissionAmount || 0) + (rentalRevenue._sum.commissionAmount || 0),
      },
    });
  } catch (error) { next(error); }
};

exports.getUserGrowthReport = async (req, res, next) => {
  try {
    const [totalRiders, totalDrivers, totalStoreOwners, totalProviders, totalAdmins] = await Promise.all([
      prisma.user.count({ where: { role: 'RIDER' } }),
      prisma.user.count({ where: { role: 'DRIVER' } }),
      prisma.user.count({ where: { role: 'STORE_OWNER' } }),
      prisma.user.count({ where: { role: 'SERVICE_PROVIDER' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
    ]);
    res.json({ success: true, data: { totalRiders, totalDrivers, totalStoreOwners, totalProviders, totalAdmins, total: totalRiders + totalDrivers + totalStoreOwners + totalProviders + totalAdmins } });
  } catch (error) { next(error); }
};

exports.getRideStatsReport = async (req, res, next) => {
  try {
    const [total, completed, cancelled, avgFare] = await Promise.all([
      prisma.ride.count(),
      prisma.ride.count({ where: { status: 'COMPLETED' } }),
      prisma.ride.count({ where: { status: 'CANCELLED' } }),
      prisma.ride.aggregate({ where: { status: 'COMPLETED' }, _avg: { totalFare: true } }),
    ]);
    res.json({ success: true, data: { total, completed, cancelled, avgFare: avgFare._avg.totalFare || 0 } });
  } catch (error) { next(error); }
};
