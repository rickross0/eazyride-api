/**
 * Rider Interface — Auth Tests
 * Tests: Registration, Login, Token validation, /auth/me
 */
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const helpers = require('../helpers');

describe('Rider Auth', () => {
  let request;

  before(async () => {
    const supertest = await helpers.getSupertest();
    request = supertest(helpers.getApp());
  });

  it('should register a new rider with valid phone', async () => {
    const phone = `+252${Math.floor(Math.random() * 900000000 + 100000000)}`;
    const res = await request
      .post('/api/v1/auth/register')
      .send({
        phone,
        password: 'test1234',
        firstName: 'Rider',
        lastName: 'Test',
        role: 'RIDER',
      });

    assert.equal(res.status, 201, `Expected 201, got ${res.status}: ${JSON.stringify(res.body)}`);
    assert.ok(res.body.token, 'Should return a JWT token');
    assert.equal(res.body.user.role, 'RIDER');
    assert.equal(res.body.user.phone, phone);
  });

  it('should reject duplicate phone registration', async () => {
    const phone = `+252${Math.floor(Math.random() * 900000000 + 100000000)}`;
    await request.post('/api/v1/auth/register').send({
      phone, password: 'test1234', firstName: 'Dup', lastName: 'User', role: 'RIDER',
    });
    const res = await request.post('/api/v1/auth/register').send({
      phone, password: 'test1234', firstName: 'Dup', lastName: 'User2', role: 'RIDER',
    });
    assert.equal(res.status, 409);
    assert.ok(res.body.error);
  });

  it('should reject registration with missing fields', async () => {
    const res = await request
      .post('/api/v1/auth/register')
      .send({ phone: '+2526000000' }); // missing password, firstName, lastName
    assert.equal(res.status, 400);
  });

  it('should reject registration with invalid phone format', async () => {
    const res = await request
      .post('/api/v1/auth/register')
      .send({ phone: '123', password: 'test1234', firstName: 'Bad', lastName: 'Phone' });
    assert.equal(res.status, 400);
  });

  it('should login with phone and password', async () => {
    const phone = `+252${Math.floor(Math.random() * 900000000 + 100000000)}`;
    await request.post('/api/v1/auth/register').send({
      phone, password: 'test1234', firstName: 'Login', lastName: 'Test', role: 'RIDER',
    });
    const res = await request
      .post('/api/v1/auth/login')
      .send({ phone, password: 'test1234' });
    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.equal(res.body.user.phone, phone);
  });

  it('should reject login with wrong password', async () => {
    const phone = `+252${Math.floor(Math.random() * 900000000 + 100000000)}`;
    await request.post('/api/v1/auth/register').send({
      phone, password: 'test1234', firstName: 'Wrong', lastName: 'Pass', role: 'RIDER',
    });
    const res = await request
      .post('/api/v1/auth/login')
      .send({ phone, password: 'wrongpassword' });
    assert.equal(res.status, 401);
  });

  it('should reject login with non-existent phone', async () => {
    const res = await request
      .post('/api/v1/auth/login')
      .send({ phone: '+252999999999', password: 'test1234' });
    assert.equal(res.status, 401);
  });

  it('should get current user with valid token (GET /auth/me)', async () => {
    const { token, user } = await helpers.registerUser(request, { role: 'RIDER' });
    const res = await request
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.user.id, user.id);
    assert.equal(res.body.user.role, 'RIDER');
  });

  it('should reject /auth/me without token', async () => {
    const res = await request.get('/api/v1/auth/me');
    assert.equal(res.status, 401);
  });

  it('should reject /auth/me with invalid token', async () => {
    const res = await request
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalidtoken123');
    assert.equal(res.status, 401);
  });
});
