/**
 * Rider Interface — Food Delivery Tests
 * Tests: List restaurants, Get restaurant, Menu items, Create food order, Get food orders
 */
const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const helpers = require('../helpers');

describe('Rider Food Delivery', () => {
  let request;
  let riderToken;

  before(async () => {
    const supertest = await helpers.getSupertest();
    request = supertest(helpers.getApp());
    const reg = await helpers.registerUser(request, { role: 'RIDER', firstName: 'FoodTest' });
    riderToken = reg.token;
  });

  it('should list restaurants', async () => {
    const res = await request
      .get('/api/v1/restaurants')
      .set('Authorization', `Bearer ${riderToken}`);
    assert.equal(res.status, 200, `Got ${res.status}: ${JSON.stringify(res.body)}`);
    assert.ok(Array.isArray(res.body.restaurants));
  });

  it('should list restaurants with pagination', async () => {
    const res = await request
      .get('/api/v1/restaurants?page=1&limit=5')
      .set('Authorization', `Bearer ${riderToken}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.page !== undefined);
    assert.ok(res.body.total !== undefined);
    assert.ok(res.body.pages !== undefined);
  });

  it('should get a single restaurant', async () => {
    // First list restaurants to get an ID
    const listRes = await request
      .get('/api/v1/restaurants')
      .set('Authorization', `Bearer ${riderToken}`);
    if (listRes.body.restaurants.length === 0) {
      // Skip if no restaurants seeded
      return;
    }
    const id = listRes.body.restaurants[0].id;
    const res = await request
      .get(`/api/v1/restaurants/${id}`)
      .set('Authorization', `Bearer ${riderToken}`);
    assert.equal(res.status, 200);
    assert.ok(res.body.restaurant);
    assert.equal(res.body.restaurant.id, id);
  });

  it('should return 404 for non-existent restaurant', async () => {
    const res = await request
      .get('/api/v1/restaurants/nonexistent-id')
      .set('Authorization', `Bearer ${riderToken}`);
    assert.equal(res.status, 404);
  });

  it('should list menu items', async () => {
    const res = await request
      .get('/api/v1/menu')
      .set('Authorization', `Bearer ${riderToken}`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.items));
  });

  it('should reject unauthenticated restaurant listing', async () => {
    const res = await request.get('/api/v1/restaurants');
    assert.equal(res.status, 401);
  });

  it('should create a food order', async () => {
    // Get restaurants first
    const listRes = await request
      .get('/api/v1/restaurants')
      .set('Authorization', `Bearer ${riderToken}`);
    if (listRes.body.restaurants.length === 0) return;

    const restaurant = listRes.body.restaurants[0];
    // Get menu items for this restaurant
    const menuRes = await request
      .get(`/api/v1/menu?restaurantId=${restaurant.id}`)
      .set('Authorization', `Bearer ${riderToken}`);
    if (menuRes.body.items.length === 0) return;

    const menuItem = menuRes.body.items[0];
    const res = await request
      .post('/api/v1/food-orders')
      .set('Authorization', `Bearer ${riderToken}`)
      .send({
        restaurantId: restaurant.id,
        items: [{ menuItemId: menuItem.id, quantity: 2 }],
        deliveryAddress: '123 Test St',
        deliveryLatitude: 8.5,
        deliveryLongitude: 47.5,
        deliveryMode: 'DELIVERY',
        notes: 'No onions please',
      });

    assert.equal(res.status, 201, `Expected 201, got ${res.status}: ${JSON.stringify(res.body)}`);
    assert.ok(res.body.order);
    assert.equal(res.body.order.status, 'PENDING');
  });

  it('should reject food order without items', async () => {
    const res = await request
      .post('/api/v1/food-orders')
      .set('Authorization', `Bearer ${riderToken}`)
      .send({ restaurantId: 'fake-id', items: [] });
    assert.equal(res.status, 400);
  });

  it('should get food orders', async () => {
    const res = await request
      .get('/api/v1/food-orders')
      .set('Authorization', `Bearer ${riderToken}`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.orders));
  });
});
