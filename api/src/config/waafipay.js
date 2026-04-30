// ============================================================
// WaafiPay Configuration — v3.0.0
// ============================================================

const WAAFI_CONFIG = {
  sandbox: {
    baseUrl: 'https://sandbox.waafipay.com/merchant',
    merchantUid: process.env.WAAFI_MERCHANT_UID,
    apiUserId: process.env.WAAFI_API_USER_ID,
    apiKey: process.env.WAAFI_API_KEY,
  },
  production: {
    baseUrl: 'https://api.waafipay.com/merchant',
    merchantUid: process.env.WAAFI_MERCHANT_UID,
    apiUserId: process.env.WAAFI_API_USER_ID,
    apiKey: process.env.WAAFI_API_KEY,
  }
};

const getWaafiConfig = () => {
  const env = process.env.WAAFI_ENV || 'sandbox';
  return WAAFI_CONFIG[env] || WAAFI_CONFIG.sandbox;
};

module.exports = { getWaafiConfig, WAAFI_CONFIG };
