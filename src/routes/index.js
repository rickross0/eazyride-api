// ============================================================
// Main API Router — EazyRide + Haye! v3.0.0
// ============================================================

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const driverRoutes = require('./driver.routes');
const riderRoutes = require('./rider.routes');
const rideRoutes = require('./ride.routes');
const orderRoutes = require('./order.routes');
const foodOrderRoutes = require('./foodOrders');
const storeRoutes = require('./store.routes');
const menuRoutes = require('./menu.routes');
const carRentalRoutes = require('./carRental.routes');
const providerRoutes = require('./provider.routes');
const paymentRoutes = require('./payment.routes');
const walletRoutes = require('./wallet.routes');
const notificationRoutes = require('./notification.routes');
const adminRoutes = require('./admin.routes');
const lotteryRoutes = require('./lottery.routes');
const promotionRoutes = require('./promotion.routes');
const chatRoutes = require('./chat.routes');
const sosRoutes = require('./sos.routes');
const reportRoutes = require('./report.routes');
const settingsRoutes = require('./settings.routes');

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    version: '3.0.0',
    timestamp: new Date().toISOString()
  });
});

// API info
router.get('/', (req, res) => {
  res.json({
    name: 'EazyRide + Haye! API',
    version: '3.0.0',
    description: 'Premium Super-App Platform for Somalia',
    endpoints: {
      auth: '/auth',
      users: '/users',
      drivers: '/drivers',
      riders: '/riders',
      rides: '/rides',
      orders: '/orders',
      foodOrders: '/food-orders',
      stores: '/stores',
      menu: '/menu',
      carRental: '/car-rental',
      providers: '/providers',
      payments: '/payments',
      wallet: '/wallet',
      notifications: '/notifications',
      admin: '/admin',
      lottery: '/lottery',
      promotions: '/promotions',
      chat: '/chat',
      sos: '/sos',
      reports: '/reports',
      settings: '/settings'
    }
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/drivers', driverRoutes);
router.use('/riders', riderRoutes);
router.use('/rides', rideRoutes);
router.use('/orders', orderRoutes);
router.use('/food-orders', foodOrderRoutes);
router.use('/stores', storeRoutes);
router.use('/menu', menuRoutes);
router.use('/car-rental', carRentalRoutes);
router.use('/providers', providerRoutes);
router.use('/payments', paymentRoutes);
router.use('/wallet', walletRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);
router.use('/lottery', lotteryRoutes);
router.use('/promotions', promotionRoutes);
router.use('/promos', promotionRoutes);
router.use('/chat', chatRoutes);
router.use('/sos', sosRoutes);
router.use('/reports', reportRoutes);
router.use('/settings', settingsRoutes);

module.exports = router;
