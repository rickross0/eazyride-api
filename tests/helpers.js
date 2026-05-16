/**
 * Test helpers for EazyRide+Haye! API integration tests.
 * Uses Node.js built-in test runner (node:test) and assert (node:assert).
 * Requires supertest for HTTP assertions against the Express app.
 *
 * Prerequisites:
 *   1. PostgreSQL running and migrated: npx prisma migrate dev
 *   2. Redis running on localhost:6379
 *   3. Seed data loaded: npm run db:seed
 *   4. npm install --save-dev supertest (or npm ci after adding to devDeps)
 */

const { describe, it, before, after, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const jwt = require('jsonwebtoken');

// We lazy-load the app so tests can control when the server starts
let _app = null;
let _server = null;
let _supertest = null;

function getApp() {
  if (!_app) {
    // Set test env
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-integration';
    _app = require('../src/server').app;
  }
  return _app;
}

async function getSupertest() {
  if (!_supertest) {
    _supertest = await import('supertest');
  }
  return _supertest.default || _supertest;
}

/**
 * Generate a JWT for the given user.
 */
function signToken(userId, role, adminLevel) {
  const secret = process.env.JWT_SECRET || 'test-jwt-secret-for-integration';
  return jwt.sign({ userId, role, adminLevel }, secret, { expiresIn: '1h' });
}

/**
 * Register a new user via the API and return { token, user }.
 */
async function registerUser(request, overrides = {}) {
  const phone = overrides.phone || `+252${Math.floor(Math.random() * 900000000 + 100000000)}`;
  const res = await request
    .post('/api/v1/auth/register')
    .send({
      phone,
      password: 'test1234',
      firstName: overrides.firstName || 'Test',
      lastName: overrides.lastName || 'User',
      role: overrides.role || 'RIDER',
    });
  return { token: res.body.token, user: res.body.user, phone };
}

/**
 * Login with phone/email and password, return { token, user }.
 */
async function loginUser(request, phone, password = 'test1234') {
  const res = await request
    .post('/api/v1/auth/login')
    .send({ phone, password });
  return { token: res.body.token, user: res.body.user };
}

/**
 * Register a driver and get their profile set up.
 */
async function createDriver(request, overrides = {}) {
  const { token, user } = await registerUser(request, {
    ...overrides,
    role: 'RIDER', // register first, then register as driver
  });
  // Register driver profile
  const dpRes = await request
    .post('/api/v1/drivers/register')
    .set('Authorization', `Bearer ${token}`)
    .send({
      vehicleType: overrides.vehicleType || 'BAJAJ',
      plateNumber: overrides.plateNumber || `TEST-${Date.now()}`,
      licenseNumber: overrides.licenseNumber || `DL-TEST-${Date.now()}`,
    });
  // Use the new token with DRIVER role if returned
  const driverToken = dpRes.body.token || token;
  return { token: driverToken, user, driverProfile: dpRes.body.profile };
}

/**
 * Register a store owner and create a restaurant.
 */
async function createStoreOwner(request, overrides = {}) {
  const { token, user } = await registerUser(request, {
    ...overrides,
    role: 'STORE_OWNER',
  });
  return { token, user };
}

/**
 * Register a service provider (car rental provider).
 */
async function createProvider(request, overrides = {}) {
  const { token, user } = await registerUser(request, {
    ...overrides,
    role: 'RIDER',
  });
  return { token, user };
}

/**
 * Auth header helper.
 */
function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

module.exports = {
  describe, it, before, after, beforeEach, afterEach,
  assert,
  getApp,
  getSupertest,
  signToken,
  registerUser,
  loginUser,
  createDriver,
  createStoreOwner,
  createProvider,
  authHeader,
};
