// ============================================================
// Order (Food) Controller — v3.0.0
// ============================================================

const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { generateOrderNumber, paginate, paginationResponse } = require('../utils/helpers');
const { calculateDeliveryFee } = require('../services/fareService');
const { emitToUser } = require('../services/socketService');
const logger = require('../utils/logger');

exports.createOrder = async (req, res, next) => {
  try {
    const { storeId, items, deliveryAddress, deliveryCoordinates, specialInstructions, paymentMethod } = req.body;
    const riderId = req.user.id;

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) throw new AppError('Store not found', 404);
    if (!store.isOpen) throw new AppError('Store is closed', 400);

    // Calculate subtotal
    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } });
      if (!menuItem || !menuItem.isAvailable) throw new AppError(`Item ${item.menuItemId} unavailable`, 400);
      const totalPrice = menuItem.price * item.quantity;
      subtotal += totalPrice;
      orderItems.push({ menuItemId: item.menuItemId, quantity: item.quantity, unitPrice: menuItem.price, totalPrice, notes: item.notes });
    }

    const { deliveryFee, serviceFee } = await calculateDeliveryFee({ storeId });
    const totalAmount = subtotal + deliveryFee + serviceFee;
    const commissionAmount = subtotal * 0.10;

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(), storeId, riderId, status: 'PENDING',
        subtotal, deliveryFee, serviceFee, totalAmount, commissionAmount,
        deliveryAddress, deliveryCoordinates: deliveryCoordinates || {}, specialInstructions,
        paymentMethod, items: { create: orderItems },
      },
      include: { items: { include: { menuItem: true } }, store: true },
    });

    // Notify store
    emitToUser(store.ownerId, 'order:update', { orderId: order.id, status: 'PENDING' });
    logger.info(`Order created: ${order.orderNumber}`);
    res.status(201).json({ success: true, data: order });
  } catch (error) { next(error); }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { store: true, items: { include: { menuItem: true } }, rider: { select: { id: true, firstName: true, lastName: true, phone: true } }, driver: { select: { id: true, firstName: true, lastName: true, phone: true } } },
    });
    if (!order) throw new AppError('Order not found', 404);
    res.json({ success: true, data: order });
  } catch (error) { next(error); }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, cancelReason } = req.body;
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) throw new AppError('Order not found', 404);

    const updateData = { status };
    const statusTimestamps = { CONFIRMED: 'confirmedAt', PREPARING: 'preparingAt', READY: 'readyAt', PICKED_UP: 'pickedUpAt', DELIVERED: 'deliveredAt', CANCELLED: 'cancelledAt' };
    const field = statusTimestamps[status];
    if (field) updateData[field] = new Date();
    if (status === 'CANCELLED') { updateData.cancelReason = cancelReason; updateData.cancelledBy = req.user.id; }

    const updated = await prisma.order.update({ where: { id: req.params.id }, data: updateData });
    emitToUser(updated.riderId, 'order:update', { orderId: updated.id, status });
    if (updated.driverId) emitToUser(updated.driverId, 'order:update', { orderId: updated.id, status });
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
};

exports.getStoreOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const { skip, take, page: p, limit: l } = paginate(page, limit);
    const where = {};
    if (status) where.status = status;
    const storeOwner = await prisma.storeOwnerProfile.findUnique({ where: { userId: req.user.id } });
    if (storeOwner?.storeId) where.storeId = storeOwner.storeId;
    const [orders, total] = await Promise.all([
      prisma.order.findMany({ where, skip, take: l, orderBy: { createdAt: 'desc' }, include: { items: true, rider: { select: { firstName: true, lastName: true, phone: true } } } }),
      prisma.order.count({ where }),
    ]);
    res.json({ success: true, ...paginationResponse(orders, total, p, l) });
  } catch (error) { next(error); }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const { skip, take, page: p, limit: l } = paginate(page, limit);
    const where = {};
    if (status) where.status = status;
    const [orders, total] = await Promise.all([
      prisma.order.findMany({ where, skip, take: l, orderBy: { createdAt: 'desc' }, include: { store: { select: { name: true } }, rider: { select: { firstName: true, lastName: true, phone: true } } } }),
      prisma.order.count({ where }),
    ]);
    res.json({ success: true, ...paginationResponse(orders, total, p, l) });
  } catch (error) { next(error); }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { skip, take, page: p, limit: l } = paginate(page, limit);
    const where = { riderId: req.user.id };
    const [orders, total] = await Promise.all([
      prisma.order.findMany({ where, skip, take: l, orderBy: { createdAt: 'desc' }, include: { store: true, items: { include: { menuItem: true } } } }),
      prisma.order.count({ where }),
    ]);
    res.json({ success: true, ...paginationResponse(orders, total, p, l) });
  } catch (error) { next(error); }
};

exports.verifyPickup = async (req, res, next) => {
  try {
    const { pin } = req.body;
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) throw new AppError('Order not found', 404);
    if (order.pickupPin && order.pickupPin !== pin) throw new AppError('Invalid pickup PIN', 400);
    const updated = await prisma.order.update({ where: { id: req.params.id }, data: { status: 'PICKED_UP', pickedUpAt: new Date(), verifiedAt: new Date() } });
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
};
