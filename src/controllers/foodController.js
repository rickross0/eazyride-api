const prisma = require('../config/prisma');
const { notifyOrderUpdate } = require('../services/notification');
// Lazy-loaded to avoid circular dependency

function emitToUserSafe(...args) { const { emitToUser } = require('../sockets/rideTracking'); return emitToUser(...args); }

const getImageUrl = (req) => {
  if (req.file) {
    const host = req.get('host');
    return `${req.protocol}://${host}/uploads/${req.file.filename}`;
  }
  return null;
};

exports.listRestaurants = async (req, res) => {
  try {
    const { page = 1, limit = 20, category } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = { isActive: true };
    if (category) where.category = category;

    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({ where, orderBy: { rating: 'desc' }, skip, take: parseInt(limit) }),
      prisma.restaurant.count({ where }),
    ]);
    return res.json({ restaurants, page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
};

exports.getRestaurant = async (req, res) => {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: req.params.id },
      include: { menuItems: { where: { isAvailable: true }, orderBy: { category: 'asc' } } },
    });
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    return res.json({ restaurant });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch restaurant' });
  }
};

exports.getMenuItems = async (req, res) => {
  try {
    const { restaurantId, category } = req.query;
    const where = { isAvailable: true };
    if (restaurantId) where.restaurantId = restaurantId;
    if (category) where.category = category;

    const items = await prisma.menuItem.findMany({ where, orderBy: { isPopular: 'desc' } });
    return res.json({ items });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch menu' });
  }
};

exports.createFoodOrder = async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress, deliveryLatitude, deliveryLongitude, deliveryMode = 'DELIVERY', notes } = req.body;
    if (!restaurantId || !items || !items.length) return res.status(400).json({ error: 'restaurantId and items required' });

    const menuItems = await prisma.menuItem.findMany({ where: { id: { in: items.map((i) => i.menuItemId) } } });
    const itemMap = new Map(menuItems.map((m) => [m.id, m]));

    let subtotal = 0;
    const orderItems = items.map((i) => {
      const mi = itemMap.get(i.menuItemId);
      if (!mi) throw new Error(`Menu item ${i.menuItemId} not found`);
      const lineTotal = mi.price * i.quantity;
      subtotal += lineTotal;
      return { menuItemId: mi.id, name: mi.name, price: mi.price, quantity: i.quantity, subtotal: lineTotal, notes: i.notes };
    });

    const deliveryFee = deliveryMode === 'DELIVERY' ? 1.20 : 0;
    const serviceFee = Math.round(subtotal * 0.05 * 100) / 100;
    const totalAmount = Math.round((subtotal + deliveryFee + serviceFee) * 100) / 100;

    const order = await prisma.foodOrder.create({
      data: {
        userId: req.userId, restaurantId,
        items: { create: orderItems },
        status: 'PENDING', subtotal, deliveryFee, serviceFee, totalAmount,
        deliveryAddress, deliveryLatitude, deliveryLongitude, deliveryMode, notes,
        paymentMethod: 'wallet', paymentStatus: 'pending',
      },
      include: { items: true },
    });

    return res.status(201).json({ order });
  } catch (err) {
    console.error('Create food order error:', err);
    return res.status(500).json({ error: err.message || 'Failed to create order' });
  }
};

exports.getFoodOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = { userId: req.user.id };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.foodOrder.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (parseInt(page) - 1) * parseInt(limit), take: parseInt(limit), include: { items: true, restaurant: { select: { id: true, name: true, image: true } } } }),
      prisma.foodOrder.count({ where }),
    ]);
    return res.json({ orders, page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

exports.updateFoodOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validTransitions = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['PREPARING', 'CANCELLED'],
      PREPARING: ['READY', 'OUT_FOR_DELIVERY', 'CANCELLED'],
      READY: ['DRIVER_ASSIGNED', 'OUT_FOR_DELIVERY'],
      DRIVER_ASSIGNED: ['DRIVER_ARRIVED', 'CANCELLED'],
      DRIVER_ARRIVED: ['PICKUP_CONFIRMED', 'CANCELLED'],
      PICKUP_CONFIRMED: ['OUT_FOR_DELIVERY'],
      OUT_FOR_DELIVERY: ['DELIVERED'],
    };
    const order = await prisma.foodOrder.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!validTransitions[order.status]?.includes(status)) return res.status(400).json({ error: `Cannot transition from ${order.status} to ${status}` });

    const timestamps = { CONFIRMED: 'confirmedAt', PREPARING: 'preparingAt', PICKUP_CONFIRMED: 'pickedUpAt', OUT_FOR_DELIVERY: 'pickedUpAt', DELIVERED: 'deliveredAt', CANCELLED: 'cancelledAt' };
    const updateData = { status };
    if (timestamps[status]) updateData[timestamps[status]] = new Date();

    const updated = await prisma.foodOrder.update({ where: { id: req.params.id }, data: updateData });

    try {
      emitToUserSafe(order.userId, 'order:statusUpdate', { orderId: order.id, status, updatedAt: new Date().toISOString() });
    } catch (socketErr) {
      console.error('[Socket] Order status emit error:', socketErr.message);
    }
    await notifyOrderUpdate(order.userId, order.id, status);

    // When order is confirmed, trigger delivery driver dispatch
    if (status === 'CONFIRMED') {
      try {
        const deliveryDispatch = require('../services/deliveryDispatchService');
        deliveryDispatch.assignDriver(order.id).catch((err) => console.error('Delivery dispatch error:', err));
      } catch {}
    }

    return res.json({ order: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update order status' });
  }
};

exports.verifyPickupPin = async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin) return res.status(400).json({ error: 'PIN required' });
    const order = await prisma.foodOrder.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (!order.pickupPin) return res.status(400).json({ error: 'No pickup PIN set for this order' });
    if (order.pickupPin !== String(pin)) return res.status(400).json({ error: 'Invalid PIN' });
    if (!['DRIVER_ARRIVED', 'DRIVER_ASSIGNED'].includes(order.status)) return res.status(400).json({ error: 'Cannot verify pickup at this stage' });

    const updated = await prisma.foodOrder.update({
      where: { id: req.params.id },
      data: { status: 'PICKUP_CONFIRMED', pickupVerifiedAt: new Date(), pickedUpAt: new Date() },
    });

    try {
      emitToUserSafe(order.userId, 'order:statusUpdate', { orderId: order.id, status: 'PICKUP_CONFIRMED', updatedAt: new Date().toISOString() });
    } catch {}
    await notifyOrderUpdate(order.userId, order.id, 'PICKUP_CONFIRMED');

    return res.json({ order: updated, verified: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to verify pickup' });
  }
};

exports.createRestaurant = async (req, res) => {
  try {
    const { name, description, cuisine, address, phone, latitude, longitude, deliveryFee, minOrder, openingTime, closingTime } = req.body;
    if (!name || !cuisine || !address) return res.status(400).json({ error: 'name, cuisine, and address are required' });

    const imageUrl = getImageUrl(req);
    const restaurant = await prisma.restaurant.create({
      data: {
        ownerId: req.userId, name, description: description || null, cuisine, address,
        phone: phone || null, image: imageUrl || req.body.image || null,
        latitude: latitude ? parseFloat(latitude) : 0, longitude: longitude ? parseFloat(longitude) : 0,
        deliveryFee: deliveryFee ? parseFloat(deliveryFee) : 0, minOrder: minOrder ? parseFloat(minOrder) : 0,
        openingTime: openingTime || '08:00', closingTime: closingTime || '22:00',
      },
    });
    return res.status(201).json({ restaurant });
  } catch (err) {
    console.error('Create restaurant error:', err);
    return res.status(500).json({ error: 'Failed to create restaurant' });
  }
};

exports.updateRestaurant = async (req, res) => {
  try {
    const existing = await prisma.restaurant.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Restaurant not found' });

    const { name, description, cuisine, address, phone, isActive, latitude, longitude, deliveryFee, minOrder, openingTime, closingTime } = req.body;
    const imageUrl = getImageUrl(req);

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (cuisine !== undefined) updateData.cuisine = cuisine;
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;
    if (imageUrl) updateData.image = imageUrl;
    else if (req.body.image !== undefined) updateData.image = req.body.image || null;
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
    if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
    if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
    if (deliveryFee !== undefined) updateData.deliveryFee = parseFloat(deliveryFee);
    if (minOrder !== undefined) updateData.minOrder = parseFloat(minOrder);
    if (openingTime !== undefined) updateData.openingTime = openingTime;
    if (closingTime !== undefined) updateData.closingTime = closingTime;

    const restaurant = await prisma.restaurant.update({
      where: { id: req.params.id },
      data: updateData,
    });
    return res.json({ restaurant });
  } catch (err) {
    console.error('Update restaurant error:', err);
    return res.status(500).json({ error: 'Failed to update restaurant' });
  }
};

exports.deleteRestaurant = async (req, res) => {
  try {
    const existing = await prisma.restaurant.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Restaurant not found' });
    const restaurant = await prisma.restaurant.update({ where: { id: req.params.id }, data: { isActive: false } });
    return res.json({ restaurant });
  } catch (err) {
    console.error('Delete restaurant error:', err);
    return res.status(500).json({ error: 'Failed to delete restaurant' });
  }
};

exports.createMenuItem = async (req, res) => {
  try {
    const { restaurantId, name, description, price, category, preparationTime, isAvailable, isPopular, calories } = req.body;
    if (!restaurantId || !name || price === undefined || !category) return res.status(400).json({ error: 'restaurantId, name, price, and category are required' });
    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });

    const imageUrl = getImageUrl(req);
    const menuItem = await prisma.menuItem.create({
      data: {
        restaurantId, name, description: description || null,
        price: parseFloat(price), category,
        image: imageUrl || req.body.image || null,
        preparationTime: preparationTime ? parseInt(preparationTime) : null,
        calories: calories ? parseInt(calories) : null,
        isAvailable: isAvailable !== undefined ? (isAvailable === 'true' || isAvailable === true) : true,
        isPopular: isPopular === 'true' || isPopular === true,
      },
    });
    return res.status(201).json({ menuItem });
  } catch (err) {
    console.error('Create menu item error:', err);
    return res.status(500).json({ error: 'Failed to create menu item' });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const existing = await prisma.menuItem.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Menu item not found' });

    const { name, description, price, category, preparationTime, isAvailable, isPopular, calories, restaurantId } = req.body;
    const imageUrl = getImageUrl(req);

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (category !== undefined) updateData.category = category;
    if (imageUrl) updateData.image = imageUrl;
    else if (req.body.image !== undefined) updateData.image = req.body.image || null;
    if (preparationTime !== undefined) updateData.preparationTime = parseInt(preparationTime) || null;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable === 'true' || isAvailable === true;
    if (isPopular !== undefined) updateData.isPopular = isPopular === 'true' || isPopular === true;
    if (calories !== undefined) updateData.calories = parseInt(calories) || null;
    if (restaurantId !== undefined) updateData.restaurantId = restaurantId;

    const menuItem = await prisma.menuItem.update({
      where: { id: req.params.id },
      data: updateData,
    });
    return res.json({ menuItem });
  } catch (err) {
    console.error('Update menu item error:', err);
    return res.status(500).json({ error: 'Failed to update menu item' });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const existing = await prisma.menuItem.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: 'Menu item not found' });
    const menuItem = await prisma.menuItem.update({ where: { id: req.params.id }, data: { isAvailable: false } });
    return res.json({ menuItem });
  } catch (err) {
    console.error('Delete menu item error:', err);
    return res.status(500).json({ error: 'Failed to delete menu item' });
  }
};
