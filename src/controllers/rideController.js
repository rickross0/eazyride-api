// ============================================================
// Ride Controller — v3.0.0
// ============================================================

const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { paginate, paginationResponse } = require('../utils/helpers');
const { calculateFare } = require('../services/fareService');
const { getRoute } = require('../services/geoService');
const { emitToUser, emitToOnlineDrivers } = require('../services/socketService');
const logger = require('../utils/logger');

exports.createRide = async (req, res, next) => {
  try {
    const { pickupAddress, dropoffAddress, pickupCoordinates, dropoffCoordinates, vehicleType = 'sedan', paymentMethod = 'EVC_PLUS', promoCode } = req.body;
    const riderId = req.user.id;

    const route = await getRoute(pickupCoordinates, dropoffCoordinates);
    const fare = await calculateFare({ distance: route.distance, duration: route.duration, vehicleType, promoCode });

    const ride = await prisma.ride.create({
      data: {
        riderId, pickupAddress, dropoffAddress, pickupCoordinates, dropoffCoordinates,
        estimatedDistance: route.distance, estimatedDuration: Math.round(route.duration),
        baseFare: fare.baseFare, distanceFare: fare.distanceFare, timeFare: fare.timeFare,
        surgeFare: fare.surgeFare, totalFare: fare.totalFare, discountAmount: fare.discountAmount,
        commissionAmount: fare.commissionAmount,
      },
    });

    emitToOnlineDrivers('ride:request', { rideId: ride.id, pickup: pickupAddress, dropoff: dropoffAddress, fare: fare.totalFare });
    logger.info(`Ride created: ${ride.id}`);
    res.status(201).json({ success: true, data: ride });
  } catch (error) { next(error); }
};

exports.getRideById = async (req, res, next) => {
  try {
    const ride = await prisma.ride.findUnique({
      where: { id: req.params.id },
      include: { rider: { select: { id: true, firstName: true, lastName: true, phone: true, avatar: true } }, driver: { select: { id: true, firstName: true, lastName: true, phone: true, avatar: true, driverProfile: true } }, offers: true },
    });
    if (!ride) throw new AppError('Ride not found', 404);
    res.json({ success: true, data: ride });
  } catch (error) { next(error); }
};

exports.acceptRide = async (req, res, next) => {
  try {
    const ride = await prisma.ride.update({
      where: { id: req.params.id },
      data: { driverId: req.user.id, status: 'ACCEPTED' },
    });
    emitToUser(ride.riderId, 'ride:update', { rideId: ride.id, status: 'ACCEPTED', driverId: req.user.id });
    res.json({ success: true, data: ride });
  } catch (error) { next(error); }
};

exports.updateRideStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const ride = await prisma.ride.findUnique({ where: { id: req.params.id } });
    if (!ride) throw new AppError('Ride not found', 404);

    const updateData = { status };
    if (status === 'DRIVER_ARRIVED') updateData.startedAt = new Date();
    if (status === 'IN_PROGRESS') updateData.startedAt = updateData.startedAt || new Date();
    if (status === 'COMPLETED') { updateData.completedAt = new Date(); updateData.finalFare = ride.totalFare; }
    if (status === 'CANCELLED') { updateData.cancelledAt = new Date(); updateData.cancelledBy = req.user.id; }

    const updated = await prisma.ride.update({ where: { id: req.params.id }, data: updateData });
    emitToUser(updated.riderId, 'ride:update', { rideId: updated.id, status });
    if (updated.driverId) emitToUser(updated.driverId, 'ride:update', { rideId: updated.id, status });
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
};

exports.rateRide = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const ride = await prisma.ride.update({
      where: { id: req.params.id },
      data: { rating, ratingComment: comment },
    });
    if (ride.driverId && rating) {
      const driverRides = await prisma.ride.findMany({ where: { driverId: ride.driverId, rating: { not: null } }, select: { rating: true } });
      const avgRating = driverRides.reduce((s, r) => s + r.rating, 0) / driverRides.length;
      await prisma.driverProfile.update({ where: { userId: ride.driverId }, data: { rating: avgRating } });
    }
    res.json({ success: true, message: 'Ride rated' });
  } catch (error) { next(error); }
};

exports.createRideOffer = async (req, res, next) => {
  try {
    const { offeredFare } = req.body;
    const offer = await prisma.rideOffer.create({
      data: { rideId: req.params.id, driverId: req.user.id, offeredFare, expiresAt: new Date(Date.now() + 60000) },
    });
    const ride = await prisma.ride.findUnique({ where: { id: req.params.id } });
    if (ride) emitToUser(ride.riderId, 'ride:offer', { offerId: offer.id, offeredFare, driverId: req.user.id });
    res.status(201).json({ success: true, data: offer });
  } catch (error) { next(error); }
};

exports.cancelRide = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const ride = await prisma.ride.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: reason, cancelledBy: req.user.id },
    });
    if (ride.driverId) emitToUser(ride.driverId, 'ride:update', { rideId: ride.id, status: 'CANCELLED' });
    emitToUser(ride.riderId, 'ride:update', { rideId: ride.id, status: 'CANCELLED' });
    res.json({ success: true, data: ride });
  } catch (error) { next(error); }
};

exports.getAllRides = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const { skip, take, page: p, limit: l } = paginate(page, limit);
    const where = {};
    if (status) where.status = status;
    const [rides, total] = await Promise.all([
      prisma.ride.findMany({ where, skip, take: l, orderBy: { createdAt: 'desc' }, include: { rider: { select: { firstName: true, lastName: true, phone: true } }, driver: { select: { firstName: true, lastName: true, phone: true, driverProfile: true } } } }),
      prisma.ride.count({ where }),
    ]);
    res.json({ success: true, ...paginationResponse(rides, total, p, l) });
  } catch (error) { next(error); }
};
