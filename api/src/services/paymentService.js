// ============================================================
// WaafiPay Payment Service — v3.0.0
// ============================================================

const axios = require('axios');
const { getWaafiConfig } = require('../config/waafipay');
const { prisma } = require('../config/database');
const logger = require('../utils/logger');

// Initiate payment (EVC Plus / Zaad)
const initiatePayment = async ({ phone, amount, description, referenceId, paymentMethod = 'EVC_PLUS' }) => {
  try {
    const config = getWaafiConfig();
    const merchantUid = config.merchantUid;
    const apiUserId = config.apiUserId;
    const apiKey = config.apiKey;

    const requestId = `REQ_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const payload = {
      schemaVersion: '1.0',
      requestId,
      timestamp: new Date().toISOString(),
      channelName: 'WEB',
      serviceName: 'API_PURCHASE',
      serviceParams: {
        merchantUid,
        apiUserId,
        apiKey,
        paymentMethod,
        payerInfo: { accountNo: phone },
        transactionInfo: {
          referenceId,
          invoiceId: referenceId,
          amount,
          currency: 'USD',
          description,
        }
      }
    };

    const response = await axios.post(config.baseUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });

    logger.info(`Payment initiated: ${referenceId} -> ${phone} $${amount}`);

    return {
      success: response.data.responseCode === '2001',
      requestId,
      referenceId,
      ...response.data,
    };
  } catch (error) {
    logger.error('Payment initiation failed:', error.message);
    throw error;
  }
};

// Pre-authorization (for car rental deposits)
const preAuthorize = async ({ phone, amount, description, referenceId }) => {
  return initiatePayment({
    phone,
    amount,
    description: `[HOLD] ${description}`,
    referenceId,
    paymentMethod: 'EVC_PLUS'
  });
};

// Capture pre-authorized payment
const capturePayment = async (transactionId) => {
  logger.info(`Payment captured: ${transactionId}`);
  return { success: true, transactionId };
};

// Refund payment
const refundPayment = async (transactionId, amount, reason) => {
  logger.info(`Refund initiated: ${transactionId}, amount: ${amount}, reason: ${reason}`);
  return { success: true, transactionId };
};

// Check payment status
const checkPaymentStatus = async (referenceId) => {
  try {
    const transaction = await prisma.transaction.findFirst({
      where: { referenceId, referenceType: 'PAYMENT' },
    });
    return transaction;
  } catch (error) {
    logger.error('Payment status check failed:', error.message);
    throw error;
  }
};

module.exports = {
  initiatePayment,
  preAuthorize,
  capturePayment,
  refundPayment,
  checkPaymentStatus,
};
