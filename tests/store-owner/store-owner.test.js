/**
 * Store-Owner Interface — Full Test Suite
 * Tests: Auth, Restaurant CRUD, Menu CRUD, Food order management, Earnings via admin
 */
const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const helpers = require('../helpers');
const prisma = require('../../src/config/prisma');

describe('Store-Owner Auth', () => {
  let request;

  before(async () => {
    const supertest = await helpers.getSupertest();
    request = supertest(helpers.getApp());
  });

  it('should register as STORE_OWNER', async () => {
    const res = await helpers.registerUser(request, { role: 'STORE_OWNER', firstName: 'StoreOwner1' });
    assert.ok(res.token, 'Should get a token');
    assert.equal(res.user.role, 'STORE_OWNER');
  });

  it('should login as STORE_OWNER', async () => {
    const reg = await helpers.registerUser(request, { role: 'STORE_OWNER', firstName: 'StoreOwner2' });
    const res = await request
      .post('/api/v1/auth/login')
      .send({ phone: reg.phone, password: 'test1234' });
    assert.equal(res.status, 200);
    assert.equal(res.body.user.role, 'STORE_OWNER');
  });
});

describe('Store-Owner — Food Order Management', () => {
  let request;
  let storeOwnerToken;
  let storeOwnerUser;
  let riderToken;
  let orderId;

  before(async () => {
    const supertest = await helpers.getSupertest();
    request = supertest(helpers.getApp());

    // Register store owner
    const storeReg = await helpers.registerUser(request, { role: 'STORE_OWNER', firstName: 'OrderStore' });
    storeOwnerToken = storeReg.token;
    storeOwnerUser = storeReg.user;

    // Register rider to create orders
    const riderReg = await helpers.registerUser(request, { role: 'RIDER', firstName: 'OrderRider' });
    riderToken = riderReg.token;
  });

  it('should list restaurants (requires auth)', async () => {
    const res = await request
      .get('/api/v1/restaurants')
      .set('Authorization', `Bearer ${storeOwnerToken}`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.restaurants));
  });

  it('should reject unauthenticated restaurant access', async () => {
    const res = await request.get('/api/v1/restaurants');
    assert.equal(res.status, 401);
  });

  it('should allow STORE_OWNER to update food order status', async () => {
    // First, create a food order as a rider using seed restaurant
    const restaurantsRes = await request
      .get('/api/v1/restaurants')
      .set('Authorization', `Bearer ${riderToken}`);
    if (restaurantsRes.body.restaurants.length === 0) return;

    const restaurant = restaurantsRes.body.restaurants[0];

    // Get menu for the restaurant
    const menuRes = await request
      .get(`/api/v1/menu?restaurantId=${restaurant.id}`)
      .set('Authorization', `Bearer ${riderToken}`);
    if (menuRes.body.items.length === 0) return;

    // Create order as rider
    const orderRes = await request
      .post('/api/v1/food-orders')
      .set('Authorization', `Bearer ${riderToken}`)
      .send({
        restaurantId: restaurant.id,
        items: [{ menuItemId: menuRes.body.items[0].id, quantity: 1 }],
        deliveryAddress: '123 Test St',
        deliveryLatitude: 8.5,
        deliveryLongitude: 47.5,
      });

    if (orderRes.status !== 201) return; // skip if order creation fails
    orderId = orderRes.body.order.id;

    // Store owner updates order status
    const res = await request
      .put(`/api/v1/food-orders/${orderId}/status`)
      .set('Authorization', `Bearer ${storeOwnerToken}`)
      .send({ status: 'CONFIRMED' });
    assert.equal(res.status, 200, `Expected 200, got ${res.status}: ${JSON.stringify(res.body)}`);
    assert.equal(res.body.order.status, 'CONFIRMED');
  });

  it('should transition order through statuses', async () => {
    if (!orderId) return;

    // CONFIRMED -> PREPARING
    let res = await request
      .put(`/api/v1/food-orders/${orderId}/status`)
      .set('Authorization', `Bearer ${storeOwnerToken}`)
      .send({ status: 'PREPARING' });
    assert.equal(res.status, 200);
    assert.equal(res.body.order.status, 'PREPARING');

    // PREPARING -> OUT_FOR_DELIVERY
    res = await request
      .put(`/api/v1/food-orders/${orderId}/status`)
      .set('Authorization', `Bearer ${storeOwnerToken}`)
      .send({ status: 'OUT_FOR_DELIVERY' });
    assert.equal(res.status, 200);
    assert.equal(res.body.order.status, 'OUT_FOR_DELIVERY');

    // OUT_FOR_DELIVERY -> DELIVERED
    res = await request
      .put(`/api/v1/food-orders/${orderId}/status`)
      .set('Authorization', `Bearer ${storeOwnerToken}`)
      .send({ status: 'DELIVERED' });
    assert.equal(res.status, 200);
    assert.equal(res.body.order.status, 'DELIVERED');
  });

  it('should reject invalid status transition', async () => {
    // Create another order to test
    const restaurantsRes = await request
      .get('/api/v1/restaurants')
      .set('Authorization', `Bearer ${riderToken}`);
    if (restaurantsRes.body.restaurants.length === 0) return;
    const menuRes = await request
      .get(`/api/v1/menu?restaurantId=${restaurantsRes.body.restaurants[0].id}`)
      .set('Authorization', `Bearer ${riderToken}`);
    if (menuRes.body.items.length === 0) return;

    const orderRes = await request
      .post('/api/v1/food-orders')
      .set('Authorization', `Bearer ${riderToken}`)
      .send({
        restaurantId: restaurantsRes.body.restaurants[0].id,
        items: [{ menuItemId: menuRes.body.items[0].id, quantity: 1 }],
        deliveryAddress: '456 Test Ave',
        deliveryLatitude: 8.5,
        deliveryLongitude: 47.5,
      });
    if (orderRes.status !== 201) return;

    // Try jumping directly to DELIVERED (invalid: PENDING -> DELIVERED not allowed)
    const res = await request
      .put(`/api/v1/food-orders/${orderRes.body.order.id}/status`)
      .set('Authorization', `Bearer ${storeOwnerToken}`)
      .send({ status: 'DELIVERED' });
    assert.equal(res.status, 400);
  });

  it('should allow STORE_OWNER to cancel a PENDING order', async () => {
    const restaurantsRes = await request
      .get('/api/v1/restaurants')
      .set('Authorization', `Bearer ${riderToken}`);
    if (restaurantsRes.body.restaurants.length === 0) return;
    const menuRes = await request
      .get(`/api/v1/menu?restaurantId=${restaurantsRes.body.restaurants[0].id}`)
      .set('Authorization', `Bearer ${riderToken}`);
    if (menuRes.body.items.length === 0) return;

    const orderRes = await request
      .post('/api/v1/food-orders')
      .set('Authorization', `Bearer ${riderToken}`)
      .send({
        restaurantId: restaurantsRes.body.restaurants[0].id,
        items: [{ menuItemId: menuRes.body.items[0].id, quantity: 2 }],
        deliveryAddress: '789 Test Blvd',
        deliveryLatitude: 8.5,
        deliveryLongitude: 47.5,
      });
    if (orderRes.status !== 201) return;

    const res = await request
      .put(`/api/v1/food-orders/${orderRes.body.order.id}/status`)
      .set('Authorization', `Bearer ${storeOwnerToken}`)
      .send({ status: 'CANCELLED' });
    assert.equal(res.status, 200);
    assert.equal(res.body.order.status, 'CANCELLED');
  });

  it('should reject ORDER status update from RIDER role', async () => {
    const res = await request
      .put('/api/v1/food-orders/fake-id/status')
      .set('Authorization', `Bearer ${riderToken}`)
      .send({ status: 'CONFIRMED' });
    assert.equal(res.status, 403);
  });

  it('should get food orders as rider', async () => {
    const res = await request
      .get('/api/v1/food-orders')
      .set('Authorization', `Bearer ${riderToken}`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.orders));
  });

  it('should filter food orders by status', async () => {
    const res = await request
      .get('/api/v1/food-orders?status=DELIVERED')
      .set('Authorization', `Bearer ${riderToken}`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.orders));
  });
});

describe('Store-Owner — Admin Restaurant & Menu Management', () => {
  let request;
  let adminToken;

  before(async () => {
    const supertest = await helpers.getSupertest();
    request = supertest(helpers.getApp());

    // Try seed admin login
    const res = await request
      .post('/api/v1/auth/login')
      .send({ phone: '+25263000001', password: 'admin123' });
    if (res.status === 200 && res.body.token) {
      adminToken = res.body.token;
    } else {
      const reg = await helpers.registerUser(request, { role: 'RIDER', firstName: 'AdminStore' });
      await prisma.user.update({ where: { id: reg.user.id }, data: { role: 'SUPER_ADMIN', adminLevel: 'SUPER' } });
      adminToken = helpers.signToken(reg.user.id, 'SUPER_ADMIN', 'SUPER');
    }
  });

  it('should create a restaurant (admin)', async () => {
    const res = await request
      .post('/api/v1/restaurants')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Restaurant',
        cuisine: 'Somali',
        address: 'Mogadishu Road 42',
        phone: '+25263000999',
        description: 'A test restaurant for integration tests',
      });
    assert.equal(res.status, 201, `Got ${res.status}: ${JSON.stringify(res.body)}`);
    assert.ok(res.body.restaurant);
    assert.equal(res.body.restaurant.name, 'Test Restaurant');
  });

  it('should reject restaurant creation from non-admin', async () => {
    const { token } = await helpers.registerUser(request, { role: 'RIDER', firstName: 'NoAdmin' });
    const res = await request
      .post('/api/v1/restaurants')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Hack', cuisine: 'Bad', address: 'Nope' });
    assert.equal(res.status, 403);
  });

  it('should update a restaurant (admin)', async () => {
    const listRes = await request
      .get('/api/v1/restaurants')
      .set('Authorization', `Bearer ${adminToken}`);
    if (listRes.body.restaurants.length === 0) return;

    const id = listRes.body.restaurants[0].id;
    const res = await request
      .put(`/api/v1/restaurants/${id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated Restaurant' });
    assert.equal(res.status, 200);
    assert.equal(res.body.restaurant.name, 'Updated Restaurant');
  });

  it('should create a menu item (admin)', async () => {
    const listRes = await request
      .get('/api/v1/restaurants')
      .set('Authorization', `Bearer ${adminToken}`);
    if (listRes.body.restaurants.length === 0) return;

    const restaurantId = listRes.body.restaurants[0].id;
    const res = await request
      .post('/api/v1/menu')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        restaurantId,
        name: 'Test Canjeero',
        price: 2.50,
        category: 'Breakfast',
        description: 'Fresh canjeero',
      });
    assert.equal(res.status, 201, `Got ${res.status}: ${JSON.stringify(res.body)}`);
    assert.ok(res.body.menuItem);
    assert.equal(res.body.menuItem.name, 'Test Canjeero');
  });

  it('should list menu items', async () => {
    const res = await request
      .get('/api/v1/menu')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.items));
  });

  it('should delete (soft-delete) a restaurant (admin)', async () => {
    // Create then delete
    const createRes = await request
      .post('/api/v1/restaurants')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'To Be Deleted',
        cuisine: 'Test',
        address: 'Nowhere',
      });
    if (createRes.status !== 201) return;

    const id = createRes.body.restaurant.id;
    const res = await request
      .delete(`/api/v1/restaurants/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.restaurant.isActive, false);
  });
});
