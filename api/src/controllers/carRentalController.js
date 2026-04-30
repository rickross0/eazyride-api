// ============================================================
// Car Rental Controller — v3.0.0
// ============================================================

const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { generateBookingNumber, paginate, paginationResponse } = require('../utils/helpers');
const { calculateRentalPrice } = require('../services/fareService');
const { createEscrow } = require('../services/escrowService');
const { emitToUser } = require('../services/socketService');
const logger = require('../utils/logger');

exports.getCars = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, vehicleType, providerId } = req.query;
    const { skip, take, page: p, limit: l } = paginate(page, limit);
    const where = { isAvailable: true, isVerified: true };
    if (vehicleType) where.vehicleType = vehicleType;
    if (providerId) where.providerId = providerId;
    const [cars, total] = await Promise.all([
      prisma.car.findMany({ where, skip, take: l, orderBy: { rating: 'desc' }, include: { provider: { include: { user: { select: { firstName: true, lastName: true } } } } } }),
      prisma.car.count({ where }),
    ]);
    res.json({ success: true, ...paginationResponse(cars, total, p, l) });
  } catch (error) { next(error); }
};

exports.getCarById = async (req, res, next) => {
  try {
    const car = await prisma.car.findUnique({ where: { id: req.params.id }, include: { provider: true, _count: { select: { bookings: true } } } });
    if (!car) throw new AppError('Car not found', 404);
    res.json({ success: true, data: car });
  } catch (error) { next(error); }
};

exports.createCar = async (req, res, next) => {
  try {
    const provider = await prisma.providerProfile.findUnique({ where: { userId: req.user.id } });
    if (!provider) throw new AppError('Provider profile required', 400);
    const car = await prisma.car.create({ data: { ...req.body, providerId: provider.id } });
    res.status(201).json({ success: true, data: car });
  } catch (error) { next(error); }
};

exports.updateCar = async (req, res, next) => {
  try {
    const car = await prisma.car.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: car });
  } catch (error) { next(error); }
};

exports.deleteCar = async (req, res, next) => {
  try {
    await prisma.car.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Car deleted' });
  } catch (error) { next(error); }
};

exports.createBooking = async (req, res, next) => {
  try {
    const { carId, startDate, endDate, paymentMethod, pickupLocation, dropoffLocation } = req.body;
    const riderId = req.user.id;

    const pricing = await calculateRentalPrice({ carId, startDate, endDate });
    const booking = await prisma.carRentalBooking.create({
      data: {
        bookingNumber: generateBookingNumber(), carId, riderId, status: 'PENDING',
        startDate: new Date(startDate), endDate: new Date(endDate),
        durationHours: pricing.hours, pricePerHour: 0, pricePerDay: 0,
        subtotal: pricing.subtotal, depositAmount: pricing.depositAmount,
        serviceFee: pricing.serviceFee, totalAmount: pricing.totalAmount,
        commissionAmount: pricing.commissionAmount, providerEarnings: pricing.providerEarnings,
        pickupLocation, dropoffLocation,
        paymentMethod,
      },
    });

    // Create escrow for deposit
    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (car) {
      await createEscrow({ bookingId: booking.id, providerId: car.providerId, amount: pricing.depositAmount });
      emitToUser(car.providerId, 'reservation:update', { bookingId: booking.id, status: 'PENDING' });
    }

    logger.info(`Booking created: ${booking.bookingNumber}`);
    res.status(201).json({ success: true, data: booking });
  } catch (error) { next(error); }
};

exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await prisma.carRentalBooking.findUnique({
      where: { id: req.params.id },
      include: { car: true, rider: { select: { firstName: true, lastName: true, phone: true } }, escrow: true },
    });
    if (!booking) throw new AppError('Booking not found', 404);
    res.json({ success: true, data: booking });
  } catch (error) { next(error); }
};

exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status, cancellationReason } = req.body;
    const updateData = { status };
    if (status === 'CONFIRMED') updateData.confirmedAt = new Date();
    if (status === 'ACTIVE') updateData.startedAt = new Date();
    if (status === 'COMPLETED') updateData.completedAt = new Date();
    if (status === 'CANCELLED') { updateData.cancelledAt = new Date(); updateData.cancelledBy = req.user.id; updateData.cancellationReason = cancellationReason; }

    const booking = await prisma.carRentalBooking.update({ where: { id: req.params.id }, data: updateData });
    emitToUser(booking.riderId, 'reservation:update', { bookingId: booking.id, status });
    res.json({ success: true, data: booking });
  } catch (error) { next(error); }
};

exports.getProviderBookings = async (req, res, next) => {
  try {
    const provider = await prisma.providerProfile.findUnique({ where: { userId: req.user.id } });
    if (!provider) throw new AppError('Provider not found', 404);
    const { page = 1, limit = 20, status } = req.query;
    const { skip, take, page: p, limit: l } = paginate(page, limit);
    const where = { car: { providerId: provider.id } };
    if (status) where.status = status;
    const [bookings, total] = await Promise.all([
      prisma.carRentalBooking.findMany({ where, skip, take: l, orderBy: { createdAt: 'desc' }, include: { car: true, rider: { select: { firstName: true, lastName: true, phone: true } } } }),
      prisma.carRentalBooking.count({ where }),
    ]);
    res.json({ success: true, ...paginationResponse(bookings, total, p, l) });
  } catch (error) { next(error); }
};

exports.getMyBookings = async (req, res, next) => {
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

// Admin
exports.verifyCar = async (req, res, next) => {
  try {
    const car = await prisma.car.update({ where: { id: req.params.id }, data: { isVerified: true, verifiedAt: new Date() } });
    res.json({ success: true, data: car });
  } catch (error) { next(error); }
};
