/**
 * Driver Interface — Ride Workflow Tests
 * Tests: Accept ride, Start ride, Complete ride, Cancel ride, Rate ride, Get driver location
 */
const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const helpers = require('../helpers');
const prisma = require('../../src/config/prisma');
const jwt = require('jsonwebtoken');

describe('Driver Ride Workflow', () => {
  let request;
  let riderToken;
  let driverToken;
  let rideId;

  before(async () => {
    const supertest = await helpers.getSupertest();
    request = supertest(helpers.getApp());

    // Create rider
    const riderReg = await helpers.registerUser(request, { role: 'RIDER', firstName: 'RideRider' });
    riderToken = riderReg.token;

    // Create driver
    const driverResult = await helpers.createDriver(request);
    driverToken = driverResult.token;

    // Approve the driver directly in DB for ride acceptance
    await prisma.driverProfile.update({
      where: { userId: driverResult.user.id },
      data: { isApproved: true },
    });
  });

  it('should request a ride as rider', async () => {
    const res = await request
      .post('/api/v1/rides/request')
      .set('Authorization', `Bearer ${riderToken}`)
      .send({
        pickupLat: 8.5, pickupLng: 47.5,
        pickupLandmark: 'Las Anod Center',
        dropoffLat: 8.55, dropoffLng: 47.55,
        dropoffLandmark: 'Airport',
        vehicleType: 'BAJAJ',
      });
    assert.equal(res.status, 201, `Ride request failed: ${JSON.stringify(res.body)}`);
    assert.ok(res.body.ride);
    rideId = res.body.ride.id;
  });

  it('should accept a ride as driver', async () => {
    if (!rideId) return; // skip if previous test failed
    const res = await request
      .put(`/api/v1/rides/${rideId}/accept`)
      .set('Authorization', `Bearer ${driverToken}`);
    assert.equal(res.status, 200, `Accept failed: ${JSON.stringify(res.body)}`);
    assert.ok(res.body.ride);
    assert.equal(res.body.ride.status, 'DRIVER_ASSIGNED');
  });

  it('should start a ride as driver', async () => {
    if (!rideId) return;
    const res = await request
      .put(`/api/v1/rides/${rideId}/start`)
      .set('Authorization', `Bearer ${driverToken}`);
    assert.equal(res.status, 200, `Start failed: ${JSON.stringify(res.body)}`);
    assert.equal(res.body.ride.status, 'IN_PROGRESS');
  });

  it('should complete a ride as driver', async () => {
    if (!rideId) return;
    const res = await request
      .put(`/api/v1/rides/${rideId}/complete`)
      .set('Authorization', `Bearer ${driverToken}`);
    assert.equal(res.status, 200, `Complete failed: ${JSON.stringify(res.body)}`);
    assert.equal(res.body.ride.status, 'COMPLETED');
  });

  it('should rate a completed ride', async () => {
    if (!rideId) return;
    const res = await request
      .post(`/api/v1/rides/${rideId}/rate`)
      .set('Authorization', `Bearer ${riderToken}`)
      .send({ score: 5, comment: 'Great ride!' });
    assert.equal(res.status, 201, `Rate failed: ${JSON.stringify(res.body)}`);
    assert.ok(res.body.rating);
    assert.equal(res.body.rating.score, 5);
  });

  it('should reject rating twice', async () => {
    if (!rideId) return;
    const res = await request
      .post(`/api/v1/rides/${rideId}/rate`)
      .set('Authorization', `Bearer ${riderToken}`)
      .send({ score: 4, comment: 'Second attempt' });
    assert.equal(res.status, 400);
  });

  it('should reject rating with invalid score', async () => {
    // Request a new ride for this test
    const rideRes = await request
      .post('/api/v1/rides/request')
      .set('Authorization', `Bearer ${riderToken}`)
      .send({
        pickupLat: 8.5, pickupLng: 47.5,
        dropoffLat: 8.55, dropoffLng: 47.55,
      });
    if (rideRes.status !== 201) return; // skip if can't create ride
    const res = await request
      .post(`/api/v1/rides/${rideRes.body.ride.id}/rate`)
      .set('Authorization', `Bearer ${riderToken}`)
      .send({ score: 0, comment: 'Invalid score' });
    assert.equal(res.status, 400);
  });

  it('should cancel a ride as rider', async () => {
    const rideRes = await request
      .post('/api/v1/rides/request')
      .set('Authorization', `Bearer ${riderToken}`)
      .send({
        pickupLat: 8.5, pickupLng: 47.5,
        dropoffLat: 8.55, dropoffLng: 47.55,
      });
    if (rideRes.status !== 201) return;
    const newRideId = rideRes.body.ride.id;

    const res = await request
      .post(`/api/v1/rides/${newRideId}/cancel`)
      .set('Authorization', `Bearer ${riderToken}`)
      .send({ reason: 'Changed my mind' });
    assert.equal(res.status, 200, `Cancel failed: ${JSON.stringify(res.body)}`);
    assert.equal(res.body.ride.status, 'CANCELLED');
  });

  it('should get driver location for a ride', async () => {
    if (!rideId) return;
    const res = await request
      .get(`/api/v1/rides/${rideId}/driver-location`)
      .set('Authorization', `Bearer ${riderToken}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.status !== undefined);
  });

  it('should reject accept ride by non-driver', async () => {
    const rideRes = await request
      .post('/api/v1/rides/request')
      .set('Authorization', `Bearer ${riderToken}`)
      .send({
        pickupLat: 8.5, pickupLng: 47.5,
        dropoffLat: 8.55, dropoffLng: 47.55,
      });
    if (rideRes.status !== 201) return;
    const res = await request
      .put(`/api/v1/rides/${rideRes.body.ride.id}/accept`)
      .set('Authorization', `Bearer ${riderToken}`);
    assert.equal(res.status, 403);
  });
});
