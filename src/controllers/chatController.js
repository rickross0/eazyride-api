// ============================================================
// Chat Controller — v3.0.0
// ============================================================

const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { paginate, paginationResponse } = require('../utils/helpers');
const { emitToUser } = require('../services/socketService');

exports.getChatMessages = async (req, res, next) => {
  try {
    const { rideId, orderId, page = 1, limit = 50 } = req.query;
    const { skip, take } = paginate(page, limit);
    const where = {};
    if (rideId) where.rideId = rideId;
    if (orderId) where.orderId = orderId;
    if (!rideId && !orderId) throw new AppError('rideId or orderId required', 400);

    const [messages, total] = await Promise.all([
      prisma.chat.findMany({ where, skip, take, orderBy: { createdAt: 'asc' }, include: { sender: { select: { id: true, firstName: true, lastName: true, avatar: true } } } }),
      prisma.chat.count({ where }),
    ]);
    res.json({ success: true, data: messages });
  } catch (error) { next(error); }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, message, rideId, orderId } = req.body;
    const chat = await prisma.chat.create({
      data: { senderId: req.user.id, receiverId, message, rideId, orderId },
      include: { sender: { select: { id: true, firstName: true, lastName: true } } },
    });
    emitToUser(receiverId, 'chat:message', chat);
    res.status(201).json({ success: true, data: chat });
  } catch (error) { next(error); }
};
