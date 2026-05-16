/**
 * Driver Interface — Full Test Suite
 * Tests: Auth, Driver profile, Online/Offline, Ride acceptance, Ride completion, Earnings, Payout info
 */
const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const helpers = require('../helpers');

describe('Driver Auth & Profile', () => {
  let request;
  let driverToken;
  let driverUser;

  before(async () => {
    const supertest = await helpers.getSupertest();
    request = supertest(helpers.getApp());
  });

  it('should register a new driver', async () => {
    const phone = `+252${Math.floor(Math.random() * 900000000 + 100000000)}`;
    // Step 1: Register as user
    const regRes = await request
      .post('/api/v1/auth/register')
      .send({ phone, password: 'test1234', firstName: 'Driver', lastName: 'Test' });
    assert.equal(regRes.status, 201, `Register failed: ${JSON.stringify(regRes.body)}`);
    const token = regRes.body.token;

    // Step 2: Register driver profile
    const dpRes = await request
      .post('/api/v1/drivers/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        vehicleType: 'BAJAJ',
        plateNumber: `TST-${Date.now()}`,
        licenseNumber: `DL-${Date.now()}`,
      });
    assert.equal(dpRes.status, 201, `Driver register failed: ${JSON.stringify(dpRes.body)}`);
    assert.ok(dpRes.body.profile);
    assert.equal(dpRes.body.profile.vehicleType, 'BAJAJ');
    driverToken = dpRes.body.token || token;
    driverUser = regRes.body.user;
  });

  it('should reject duplicate driver profile', async () => {
    const phone = `+252${Math.floor(Math.random() * 900000000 + 100000000)}`;
    const regRes = await request
      .post('/api/v1/auth/register')
      .send({ phone, password: 'test1234', firstName: 'DupDriver', lastName: 'Test' });
    const token = regRes.body.token;
    await request.post('/api/v1/drivers/register')
      .set('Authorization', `Bearer ${token}`)
      .send({ plateNumber: 'DUP-001', licenseNumber: 'DUP-DL-001' });

    const dupRes = await request.post('/api/v1/drivers/register')
      .set('Authorization', `Bearer ${token}`)
      .send({ plateNumber: 'DUP-002', licenseNumber: 'DUP-DL-002' });
    assert.equal(dupRes.status, 409);
  });

  it('should reject driver profile without required fields', async () => {
    const phone = `+252${Math.floor(Math.random() * 900000000 + 100000000)}`;
    const regRes = await request
      .post('/api/v1/auth/register')
      .send({ phone, password: 'test1234', firstName: 'NoPlate', lastName: 'Driver' });
    const res = await request.post('/api/v1/drivers/register')
      .set('Authorization', `Bearer ${regRes.body.token}`)
      .send({ vehicleType: 'CAR' }); // missing plateNumber, licenseNumber
    assert.equal(res.status, 400);
  });

  it('should get driver profile', async () => {
    // Create a fresh driver for this test
    const { token } = await helpers.createDriver(request);
    const res = await request
      .get('/api/v1/drivers/profile')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 200, `Got ${res.status}: ${JSON.stringify(res.body)}`);
    assert.ok(res.body.profile);
  });

  it('should reject profile access without DRIVER role', async () => {
    const { token } = await helpers.registerUser(request, { role: 'RIDER' });
    const res = await request
      .get('/api/v1/drivers/profile')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 403);
  });
});

describe('Driver Online/Offline & Earnings', () => {
  let request;
  let driverToken;
  let driverProfile;

  before(async () => {
    const supertest = await helpers.getSupertest();
    request = supertest(helpers.getApp());
    const result = await helpers.createDriver(request);
    driverToken = result.token;
    driverProfile = result.driverProfile;
  });

  it('should reject going online if driver not approved', async () => {
    const res = await request
      .post('/api/v1/drivers/online')
      .set('Authorization', `Bearer ${driverToken}`);
    // Newly registered drivers are not approved
    assert.equal(res.status, 403);
  });

  it('should go offline (always succeeds)', async () => {
    const res = await request
      .post('/api/v1/drivers/offline')
      .set('Authorization', `Bearer ${driverToken}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'offline');
  });

  it('should get earnings (even if 0)', async () => {
    const res = await request
      .get('/api/v1/drivers/earnings')
      .set('Authorization', `Bearer ${driverToken}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.totalEarnings !== undefined);
  });

  it('should get earnings by period', async () => {
    const res = await request
      .get('/api/v1/drivers/earnings?period=week')
      .set('Authorization', `Bearer ${driverToken}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.period === 'week');
    assert.ok(res.body.dailyBreakdown !== undefined);
  });

  it('should update payout info', async () => {
    const res = await request
      .put('/api/v1/drivers/payout-info')
      .set('Authorization', `Bearer ${driverToken}`)
      .send({
        payoutMethod: 'EVC',
        payoutPhone: '+25263000099',
        bankName: 'Somali Bank',
        bankAccountNumber: '1234567890',
        bankAccountName: 'Test Driver',
      });
    assert.equal(res.status, 200, `Got ${res.status}: ${JSON.stringify(res.body)}`);
    assert.ok(res.body.profile);
  });

  it('should update push token', async () => {
    const res = await request
      .put('/api/v1/drivers/push-token')
      .set('Authorization', `Bearer ${driverToken}`)
      .send({ token: 'test-fcm-token-123' });
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
  });

  it('should reject push token without required field', async () => {
    const res = await request
      .put('/api/v1/drivers/push-token')
      .set('Authorization', `Bearer ${driverToken}`)
      .send({});
    assert.equal(res.status, 400);
  });

  it('should find nearby drivers', async () => {
    const res = await request
      .get('/api/v1/drivers/nearby?lat=8.5&lng=47.5')
      .set('Authorization', `Bearer ${driverToken}`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.drivers));
  });

  it('should reject nearby drivers without coordinates', async () => {
    const res = await request
      .get('/api/v1/drivers/nearby')
      .set('Authorization', `Bearer ${driverToken}`);
    assert.equal(res.status, 400);
  });
});
