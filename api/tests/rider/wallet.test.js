/**
 * Rider Interface — Wallet Tests
 * Tests: Balance, Deposit, Transactions
 */
const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const helpers = require('../helpers');

describe('Rider Wallet', () => {
  let request;
  let riderToken;

  before(async () => {
    const supertest = await helpers.getSupertest();
    request = supertest(helpers.getApp());
    const reg = await helpers.registerUser(request, { role: 'RIDER', firstName: 'WalletTest' });
    riderToken = reg.token;
  });

  it('should get wallet balance', async () => {
    const res = await request
      .get('/api/v1/wallet/balance')
      .set('Authorization', `Bearer ${riderToken}`);
    assert.equal(res.status, 200, `Got ${res.status}: ${JSON.stringify(res.body)}`);
    assert.ok(res.body.balance !== undefined, 'Should have balance');
    assert.ok(res.body.currency !== undefined, 'Should have currency');
  });

  it('should reject balance check without auth', async () => {
    const res = await request.get('/api/v1/wallet/balance');
    assert.equal(res.status, 401);
  });

  it('should initiate a deposit (even though WaafiPay will fail in sandbox)', async () => {
    const res = await request
      .post('/api/v1/wallet/deposit')
      .set('Authorization', `Bearer ${riderToken}`)
      .send({ phone: '+25260000001', amount: 10 });
    // WaafiPay sandbox may fail, but the endpoint should respond
    // Accept 200 (success) or 500 (WaafiPay unreachable)
    assert.ok([200, 500].includes(res.status), `Expected 200 or 500, got ${res.status}`);
  });

  it('should reject deposit with missing fields', async () => {
    const res = await request
      .post('/api/v1/wallet/deposit')
      .set('Authorization', `Bearer ${riderToken}`)
      .send({ amount: 10 }); // missing phone
    assert.equal(res.status, 400);
  });

  it('should reject deposit with zero/negative amount', async () => {
    const res = await request
      .post('/api/v1/wallet/deposit')
      .set('Authorization', `Bearer ${riderToken}`)
      .send({ phone: '+25260000001', amount: 0 });
    assert.equal(res.status, 400);
  });

  it('should get transaction history', async () => {
    const res = await request
      .get('/api/v1/wallet/transactions')
      .set('Authorization', `Bearer ${riderToken}`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.transactions));
    assert.ok(res.body.total !== undefined);
  });
});
