/**
 * Provider Interface — Car Rental Provider Tests
 * Tests: Provider registration, Car listing, Car detail, Car update, Admin provider management
 */
const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const helpers = require('../helpers');
const prisma = require('../../src/config/prisma');

describe('Provider Registration', () => {
  let request;

  before(async () => {
    const supertest = await helpers.getSupertest();
    request = supertest(helpers.getApp());
  });

  it('should register a provider', async () => {
    const { token, user } = await helpers.registerUser(request, { firstName: 'Provider1' });
    const res = await request
      .post('/api/v1/admin/providers/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        userId: user.id,
        businessName: 'Test Car Rentals',
        category: 'CAR_RENTAL',
        description: 'Premium car rental services',
        phone: '+25263000101',
      });
    assert.equal(res.status, 201, `Expected 201, got ${res.status}: ${JSON.stringify(res.body)}`);
    assert.ok(res.body.provider);
    assert.equal(res.body.provider.businessName, 'Test Car Rentals');
  });

  it('should reject provider registration without required fields', async () => {
    const { token, user } = await helpers.registerUser(request, { firstName: 'Provider2' });
    const res = await request
      .post('/api/v1/admin/providers/register')
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'Missing fields' });
    assert.equal(res.status, 400);
  });

  it('should reject duplicate provider registration', async () => {
    const { token, user } = await helpers.registerUser(request, { firstName: 'Provider3' });
    await request
      .post('/api/v1/admin/providers/register')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: user.id, businessName: 'Unique Rentals', phone: '+25263000103' });

    const res = await request
      .post('/api/v1/admin/providers/register')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: user.id, businessName: 'Another Name', phone: '+25263000104' });
    assert.equal(res.status, 409);
  });
});

describe('Provider — Car Management (via Rider API)', () => {
  let request;
  let riderToken;

  before(async () => {
    const supertest = await helpers.getSupertest();
    request = supertest(helpers.getApp());
    const reg = await helpers.registerUser(request, { role: 'RIDER', firstName: 'ProvCar' });
    riderToken = reg.token;
  });

  it('should list available cars', async () => {
    const res = await request
      .get('/api/v1/cars')
      .set('Authorization', `Bearer ${riderToken}`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.cars));
  });

  it('should filter cars by category', async () => {
    const res = await request
      .get('/api/v1/cars?category=seed-cat-sedan')
      .set('Authorization', `Bearer ${riderToken}`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.cars));
  });

  it('should get car details', async () => {
    const listRes = await request
      .get('/api/v1/cars')
      .set('Authorization', `Bearer ${riderToken}`);
    if (listRes.body.cars.length === 0) return;

    const carId = listRes.body.cars[0].id;
    const res = await request
      .get(`/api/v1/cars/${carId}`)
      .set('Authorization', `Bearer ${riderToken}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.car);
  });

  it('should update car details', async () => {
    const listRes = await request
      .get('/api/v1/cars')
      .set('Authorization', `Bearer ${riderToken}`);
    if (listRes.body.cars.length === 0) return;

    const carId = listRes.body.cars[0].id;
    const res = await request
      .put(`/api/v1/cars/${carId}`)
      .set('Authorization', `Bearer ${riderToken}`)
      .send({ pricePerDay: 30.00 });
    assert.equal(res.status, 200, `Got ${res.status}: ${JSON.stringify(res.body)}`);
    assert.ok(res.body.car);
  });
});

describe('Provider — Admin Management', () => {
  let request;
  let adminToken;

  before(async () => {
    const supertest = await helpers.getSupertest();
    request = supertest(helpers.getApp());
    // Login with seed admin
    const res = await request
      .post('/api/v1/auth/login')
      .send({ phone: '+25263000001', password: 'admin123' });
    if (res.status === 200 && res.body.token) {
      adminToken = res.body.token;
    } else {
      // If seed admin login fails, register a SUPER_ADMIN
      const reg = await helpers.registerUser(request, { role: 'RIDER', firstName: 'TestAdmin' });
      // Promote manually
      await prisma.user.update({ where: { id: reg.user.id }, data: { role: 'SUPER_ADMIN', adminLevel: 'SUPER' } });
      adminToken = helpers.signToken(reg.user.id, 'SUPER_ADMIN', 'SUPER');
    }
  });

  it('should list providers (admin)', async () => {
    const res = await request
      .get('/api/v1/admin/providers')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(res.status, 200, `Got ${res.status}: ${JSON.stringify(res.body)}`);
    assert.ok(Array.isArray(res.body.providers));
  });

  it('should set provider commission (admin)', async () => {
    // Get providers list first
    const listRes = await request
      .get('/api/v1/admin/providers')
      .set('Authorization', `Bearer ${adminToken}`);
    if (listRes.body.providers.length === 0) return;

    const providerId = listRes.body.providers[0].id;
    const res = await request
      .put(`/api/v1/admin/providers/${providerId}/commission`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ commissionRate: 0.18 });
    assert.equal(res.status, 200);
    assert.ok(res.body.provider);
  });

  it('should approve provider (admin)', async () => {
    const listRes = await request
      .get('/api/v1/admin/providers')
      .set('Authorization', `Bearer ${adminToken}`);
    if (listRes.body.providers.length === 0) return;

    const providerId = listRes.body.providers[0].id;
    const res = await request
      .put(`/api/v1/admin/providers/${providerId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.provider);
  });
});
