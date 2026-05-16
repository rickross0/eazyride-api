const crypto = require('crypto');
const axios = require('axios');

const BASE_URL = process.env.WAAFI_ENV === 'production'
  ? 'https://api.waafipay.com/asm'
  : 'http://sandbox.waafipay.net/asm';

const MERCHANT_UID = process.env.WAAFI_MERCHANT_UID;
const API_USER_ID  = process.env.WAAFI_API_USER_ID;
const API_KEY      = process.env.WAAFI_API_KEY;
const WEBHOOK_SECRET = process.env.WAAFI_WEBHOOK_SECRET || '';

class WaafiPayService {
  _buildRequest(serviceName, payerInfo, transactionInfo) {
    return {
      schemaVersion: '1.0',
      requestId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      channelName: 'WEB',
      serviceName,
      serviceParams: {
        merchantUid: MERCHANT_UID,
        apiUserId: API_USER_ID,
        apiKey: API_KEY,
        paymentMethod: 'MWALLET_ACCOUNT',
        payerInfo,
        transactionInfo,
      },
    };
  }

  async _post(payload, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const { data } = await axios.post(BASE_URL, payload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,
        });
        return data;
      } catch (e) {
        if (attempt === retries) throw e;
        await new Promise((r) => setTimeout(r, 1000 * 2 ** (attempt - 1)));
      }
    }
  }

  async initiatePurchase(phone, amount, referenceId, description = 'EazyRide payment') {
    const truncatedAmount = Math.trunc(amount * 100) / 100;
    const payload = this._buildRequest(
      'API_PURCHASE',
      { accountNo: phone },
      {
        referenceId,
        invoiceId: referenceId,
        amount: String(truncatedAmount),
        currency: 'USD',
        description,
      }
    );
    const response = await this._post(payload);
    return {
      transactionId: response.params?.transactionId || response.params?.trxId || null,
      status: response.responseCode === '2001' ? 'PENDING' : 'FAILED',
      responseCode: response.responseCode,
      responseMsg: response.responseMsg,
      raw: response,
    };
  }

  async cancelPurchase(transactionId, referenceId) {
    const payload = this._buildRequest(
      'API_CANCELPURCHASE',
      { accountNo: '' },
      {
        referenceId: referenceId || transactionId,
        transactionId,
        amount: '0',
        currency: 'USD',
        description: 'Cancel purchase',
      }
    );
    const response = await this._post(payload);
    return {
      transactionId,
      status: response.responseCode === '2001' ? 'CANCELLED' : 'FAILED',
      responseCode: response.responseCode,
      responseMsg: response.responseMsg,
      raw: response,
    };
  }

  async preauthorize(phone, amount, referenceId, description = 'EazyRide deposit hold') {
    const truncatedAmount = Math.trunc(amount * 100) / 100;
    const payload = this._buildRequest(
      'API_PREAUTHORIZE',
      { accountNo: phone },
      {
        referenceId,
        invoiceId: referenceId,
        amount: String(truncatedAmount),
        currency: 'USD',
        description,
      }
    );
    const response = await this._post(payload);
    return {
      transactionId: response.params?.transactionId || response.params?.trxId || null,
      status: response.responseCode === '2001' ? 'HELD' : 'FAILED',
      responseCode: response.responseCode,
      responseMsg: response.responseMsg,
      raw: response,
    };
  }

  async commitPreauth(transactionId, amount, referenceId) {
    const truncatedAmount = Math.trunc(amount * 100) / 100;
    const payload = this._buildRequest(
      'API_PREAUTHORIZE_COMMIT',
      { accountNo: '' },
      {
        referenceId,
        transactionId,
        amount: String(truncatedAmount),
        currency: 'USD',
        description: 'Commit preauthorization',
      }
    );
    const response = await this._post(payload);
    return {
      transactionId,
      status: response.responseCode === '2001' ? 'COMMITTED' : 'FAILED',
      responseCode: response.responseCode,
      responseMsg: response.responseMsg,
      raw: response,
    };
  }

  async cancelPreauth(transactionId, amount, referenceId) {
    const truncatedAmount = Math.trunc(amount * 100) / 100;
    const payload = this._buildRequest(
      'API_PREAUTHORIZE_CANCEL',
      { accountNo: '' },
      {
        referenceId,
        transactionId,
        amount: String(truncatedAmount),
        currency: 'USD',
        description: 'Cancel preauthorization',
      }
    );
    const response = await this._post(payload);
    return {
      transactionId,
      status: response.responseCode === '2001' ? 'CANCELLED' : 'FAILED',
      responseCode: response.responseCode,
      responseMsg: response.responseMsg,
      raw: response,
    };
  }

  verifyWebhook(req) {
    if (!WEBHOOK_SECRET) return false;

    const timestamp = req.headers['x-webhook-timestamp'];
    const eventId = req.headers['x-webhook-event-id'];
    const signature = req.headers['x-webhook-signature'];
    const rawBody = req.rawBody;

    if (!timestamp || !eventId || !signature || !rawBody) return false;

    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - parseInt(timestamp)) > 300) return false;

    const signingString = `${timestamp}.${eventId}.${rawBody}`;
    const expected = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(signingString)
      .digest('hex');

    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expected)
      );
    } catch {
      return false;
    }
  }
}

module.exports = new WaafiPayService();
