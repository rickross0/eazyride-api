// ============================================================
// Payment Controller — v3.0.0
// ============================================================

const { prisma } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');
const { initiatePayment, checkPaymentStatus } = require('../services/paymentService');
const logger = require('../utils/logger');

exports.initiatePayment = async (req, res, next) => {
  try {
    const { phone, amount, description, referenceId, paymentMethod } = req.body;
    const result = await initiatePayment({ phone, amount, description, referenceId, paymentMethod });
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
};

exports.getPaymentStatus = async (req, res, next) => {
  try {
    const transaction = await checkPaymentStatus(req.params.referenceId);
    res.json({ success: true, data: transaction });
  } catch (error) { next(error); }
};

exports.waafiPayWebhook = async (req, res, next) => {
  try {
    const { responseCode, transactionId, referenceId } = req.body;
    logger.info(`WaafiPay webhook: ${transactionId} -> ${responseCode}`);
    if (responseCode === '2001') {
      await prisma.transaction.updateMany({
        where: { referenceId, referenceType: 'PAYMENT' },
        data: { status: 'COMPLETED' },
      });
    }
    res.json({ success: true });
  } catch (error) { next(error); }
};
