/**
 * Rider Interface — Ride Tests
 * Tests: Fare estimation, Ride request, Ride tracking, Ride history, Rate ride, Cancel ride
 */
const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const helpers = require('../helpers');

describe('Rider Rides', () => {
  let request;
  let riderToken;
  let riderUser;

  before(async () => {
    const supertest = await helpers.getSupertest();
    request = supertest(helpers.getApp());
    const reg = await helpers.registerUser(request, { role: 'RIDER', firstName: 'RiderRide' });
    riderToken = reg.token;
    riderUser = reg.user;
  });

  it('should estimate fare for a ride', async () => {
    const res = await request
      .get('/api/v1/rides/estimate')
      .query({ pickupLat: 8.5, pickupLng: 47.5, dropoffLat: 8.55, dropoffLng: 47.55 })
      .set('Authorization', `Bearer ${riderToken}`);
    assert.equal(res.status, 200, `Expected 200, got ${res.status}: ${JSON.stringify(res.body)}`);
    assert.ok(res.body.estimatedFare !== undefined, 'Should have estimatedFare');
    assert.ok(res.body.distance !== undefined, 'Should have distance');
    assert.ok(res.body.surgeMultiplier !== undefined, 'Should have surgeMultiplier');
  });

  it('should reject fare estimate without coordinates', async () => {
    const res = await request
      .get('/api/v1/rides/estimate')
      .set('Authorization', `Bearer ${riderToken}`);
    assert.equal(res.status, 400);
  });

  it('should request a ride as a rider', async () => {
    const res = await request
      .post('/api/v1/rides/request')
      .set('Authorization', `Bearer ${riderToken}`)
      .send({
        pickupLat: 8.5,
        pickupLng: 47.5,
        pickupLandmark: 'Test Pickup',
        dropoffLat: 8.55,
        dropoffLng: 47.55,
        dropoffLandmark: 'Test Dropoff',
        vehicleType: 'BAJAJ',
      });
    assert.equal(res.status, 201, `Expected 201, got ${res.status}: ${JSON.stringify(res.body)}`);
    assert.ok(res.body.ride, 'Should return ride object');
    assert.equal(res.body.ride.status, 'REQUESTED');
    assert.equal(res.body.ride.vehicleType, 'BAJAJ');
  });

  it('should reject ride request from non-RIDER role', async () => {
    const { token } = await helpers.registerUser(request, { role: 'DRIVER', firstName: 'FakeRider' });
    const res = await request
      .post('/api/v1/rides/request')
      .set('Authorization', `Bearer ${token}`)
      .send({
        pickupLat: 8.5, pickupLng: 47.5,
        dropoffLat: 8.55, dropoffLng: 47.55,
      });
    assert.equal(res.status, 403);
  });

  it('should get ride history', async () => {
    const res = await request
      .get('/api/v1/rides')
      .set('Authorization', `Bearer ${riderToken}`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.rides), 'Should return rides array');
    assert.ok(res.body.total !== undefined, 'Should have total');
  });

  it('should filter ride history by status', async () => {
    const res = await request
      .get('/api/v1/rides?status=REQUESTED')
      .set('Authorization', `Bearer ${riderToken}`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.rides));
  });

  it('should reject unauthenticated ride request', async () => {
    const res = await request
      .post('/api/v1/rides/request')
      .send({
        pickupLat: 8.5, pickupLng: 47.5,
        dropoffLat: 8.55, dropoffLng: 47.55,
      });
    assert.equal(res.status, 401);
  });

  it('should reject ride request with missing coordinates', async () => {
    const res = await request
      .post('/api/v1/rides/request')
      .set('Authorization', `Bearer ${riderToken}`)
      .send({ pickupLat: 8.5 }); // missing other coordinates
    assert.equal(res.status, 400);
  });
});
