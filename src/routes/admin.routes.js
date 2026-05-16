const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');
const { prisma } = require('../config/database');
const driverController = require('../controllers/driverController');
const rideController = require('../controllers/rideController');
const orderController = require('../controllers/orderController');
const providerController = require('../controllers/providerController');
const settingsController = require('../controllers/settingsController');
const legalController = require('../controllers/legalController');
const lotteryController = require('../controllers/lotteryController');
const carRentalController = require('../controllers/carRentalController');
const reportController = require('../controllers/reportController');
const walletController = require('../controllers/walletController');
const storeController = require('../controllers/storeController');
const menuController = require('../controllers/menuController');

const { authenticate } = require('../middleware/auth');
const { requireRole, requirePermission } = require('../middleware/roleCheck');

router.use(authenticate, requireRole('ADMIN'));
router.get('/dashboard', adminController.getDashboardStats);
router.get('/recent-activity', adminController.getRecentActivity);

// Promo Codes
router.get('/promo-codes', adminController.getPromoCodes);
router.post('/promo-codes', adminController.createPromoCode);
router.delete('/promo-codes/:id', adminController.deletePromoCode);

// Fare Settings
router.get('/fare-settings', requirePermission('VIEW_PRICING'), adminController.getFareSettings);
router.put('/fare-settings/:vehicleType', requirePermission('SET_PRICING'), adminController.updateFareSetting);

// Surge Zones
router.get('/surge-zones', requirePermission('MANAGE_SURGE_ZONES'), adminController.getSurgeZones);
router.post('/surge-zones', requirePermission('MANAGE_SURGE_ZONES'), adminController.createSurgeZone);
router.delete('/surge-zones/:id', requirePermission('MANAGE_SURGE_ZONES'), adminController.deleteSurgeZone);

// Feature Toggles
router.get('/feature-toggles', requirePermission('MANAGE_FEATURE_TOGGLES'), adminController.getFeatureToggles);
router.patch('/feature-toggles/:key', requirePermission('MANAGE_FEATURE_TOGGLES'), adminController.updateFeatureToggle);

// Staff
router.get('/staff', requirePermission('MANAGE_STAFF'), adminController.getStaff);
router.post('/staff', requirePermission('MANAGE_STAFF'), adminController.createStaff);

// Audit Log
router.get('/audit-log', requirePermission('VIEW_AUDIT_LOG'), adminController.getAuditLog);


// Users
router.get('/users', requirePermission('VIEW_USERS'), userController.getAllUsers);

// Drivers
router.get('/drivers', requirePermission('VIEW_DRIVERS'), driverController.getAllDrivers);
router.get('/online-drivers', requirePermission('VIEW_DRIVERS'), driverController.getOnlineDrivers);

// Rides
router.get('/rides', requirePermission('VIEW_RIDES'), rideController.getAllRides);

// Orders
router.get('/orders', requirePermission('VIEW_ORDERS'), orderController.getAllOrders);

// Providers
router.get('/providers', requirePermission('VIEW_PROVIDERS'), providerController.getAllProvidersAdmin);

// Settings
router.get('/settings', requirePermission('MANAGE_SETTINGS'), settingsController.getAppSettings);
router.post('/settings', requirePermission('MANAGE_SETTINGS'), settingsController.updateAppSetting);

// Legal
router.get('/legal/terms', legalController.getTerms);
router.put('/legal/terms', requirePermission('UPDATE_TERMS'), legalController.updateTerms);

// Support Contacts
router.get('/support/contacts', settingsController.getSupportContacts);
router.post('/support/contacts', requirePermission('UPDATE_SUPPORT'), settingsController.createSupportContact);
router.put('/support/contacts/:id', requirePermission('UPDATE_SUPPORT'), settingsController.updateSupportContact);
router.delete('/support/contacts/:id', requirePermission('UPDATE_SUPPORT'), settingsController.deleteSupportContact);

// Lottery Admin
router.get('/lotteries', lotteryController.getLotteries);
router.post('/lotteries', requirePermission('MANAGE_SETTINGS'), lotteryController.createLottery);
router.put('/lotteries/:id', requirePermission('MANAGE_SETTINGS'), lotteryController.updateLottery);
router.delete('/lotteries/:id', requirePermission('MANAGE_SETTINGS'), lotteryController.deleteLottery);
router.post('/lotteries/:id/draw', requirePermission('MANAGE_SETTINGS'), lotteryController.drawLottery);
router.get('/lotteries/stats', lotteryController.getLotteryStats);

// Cars
router.get('/cars', carRentalController.getCars);
router.patch('/cars/:id/verify', requirePermission('VERIFY_CARS'), carRentalController.verifyCar);

// Reports
router.get('/reports', requirePermission('VIEW_REPORTS'), reportController.getReports);
router.post('/reports', requirePermission('GENERATE_REPORTS'), reportController.generateReport);

// Pricing / Commissions (alias for fare-settings)
router.get('/pricing', requirePermission('VIEW_PRICING'), adminController.getFareSettings);
router.post('/commissions', requirePermission('SET_COMMISSIONS'), adminController.updateFareSetting);
// Users Admin
router.put('/users/:id/suspend', requirePermission('SUSPEND_USERS'), userController.toggleUserStatus);
router.put('/users/:id/activate', requirePermission('SUSPEND_USERS'), userController.toggleUserStatus);
router.put('/users/:id/reset-password', requirePermission('RESET_PASSWORD'), userController.resetPassword);
router.put('/users/:id/role', requirePermission('CHANGE_ROLES'), userController.updateUserRole);
router.delete('/users/:id', requirePermission('DELETE_USERS'), userController.deleteUser);

// Drivers Admin
router.put('/drivers/:id/approve', requirePermission('APPROVE_DRIVERS'), driverController.approveDriver);
router.put('/drivers/:id/reject', requirePermission('APPROVE_DRIVERS'), driverController.rejectDriver);
router.put('/drivers/:id/suspend', requirePermission('SUSPEND_USERS'), driverController.suspendDriver);

// Payouts Admin
router.get('/payouts', requirePermission('VIEW_PAYOUTS'), walletController.getPayouts);
router.put('/payouts/:id/complete', requirePermission('APPROVE_PAYOUTS_SMALL'), walletController.completePayout);
router.put('/payouts/:id/approve', requirePermission('APPROVE_PAYOUTS_SMALL'), walletController.approvePayout);
router.put('/payouts/:id/reject', requirePermission('APPROVE_PAYOUTS_SMALL'), walletController.rejectPayout);

// Restaurants / Stores Admin
router.get('/restaurants', requirePermission('VIEW_RESTAURANTS'), storeController.getAllStoresAdmin);
router.get('/restaurants/:id', storeController.getStoreById);
router.post('/restaurants', requirePermission('VIEW_RESTAURANTS'), storeController.createStore);
router.put('/restaurants/:id', requirePermission('VIEW_RESTAURANTS'), storeController.updateStore);
router.delete('/restaurants/:id', requirePermission('VIEW_RESTAURANTS'), storeController.toggleStoreOpen);

// Menu Admin
router.get('/menu', menuController.getMenuItems);
router.post('/menu', requirePermission('VIEW_RESTAURANTS'), menuController.createMenuItem);
router.put('/menu/:id', requirePermission('VIEW_RESTAURANTS'), menuController.updateMenuItem);
router.delete('/menu/:id', requirePermission('VIEW_RESTAURANTS'), menuController.deleteMenuItem);


// Lottery Aliases
router.get('/lottery/config', lotteryController.getLotteries);
router.post('/lottery/config', requirePermission('MANAGE_SETTINGS'), lotteryController.createLottery);
router.post('/lottery/draw', requirePermission('MANAGE_SETTINGS'), async (req, res, next) => {
  try {
    const lotteries = await prisma.lottery.findMany({ where: { status: 'ACTIVE' }, orderBy: { createdAt: 'desc' }, take: 1 });
    if (!lotteries.length) return res.status(400).json({ error: 'No active lottery' });
    req.params.id = lotteries[0].id;
    return lotteryController.drawLottery(req, res, next);
  } catch (err) { next(err); }
});
router.get('/lottery/tickets', lotteryController.getLotteryStats);
router.post('/lottery/tickets', requirePermission('MANAGE_SETTINGS'), (req, res) => res.status(501).json({ error: 'Creating tickets via admin is not supported' }));
router.get('/lottery/winners', async (req, res, next) => {
  try {
    const winners = await prisma.lotteryTicket.findMany({ where: { status: 'WINNER' }, include: { lottery: true, user: { select: { firstName: true, lastName: true, phone: true } } }, orderBy: { createdAt: 'desc' }, take: 50 });
    res.json({ success: true, data: winners });
  } catch (err) { next(err); }
});


// Staff placeholders
router.get('/custom-roles', requirePermission('MANAGE_STAFF'), (req, res) => res.json({ success: true, data: [] }));
router.post('/master-login', requirePermission('MASTER_LOGIN'), (req, res) => res.json({ success: true, token: 'master-token' }));
router.get('/staff/permissions', requirePermission('MANAGE_STAFF'), (req, res) => res.json({ success: true, data: { permissions: [] } }));


// Provider earnings placeholder
router.get('/provider-earnings', requirePermission('VIEW_PROVIDERS'), async (req, res, next) => {
  try {
    const providers = await prisma.providerProfile.findMany({ include: { user: { select: { firstName: true, lastName: true } } }, take: 50 });
    res.json({ success: true, data: providers.map(p => ({ id: p.id, name: p.businessName || p.user?.firstName || 'Provider', earnings: p.totalRevenue || 0, jobs: p.totalJobs || 0 })) });
  } catch (err) { next(err); }
});

module.exports = router;

// Bulk update support contacts
router.put('/support/contacts', requirePermission('UPDATE_SUPPORT'), async (req, res, next) => {
  try {
    const contacts = Array.isArray(req.body) ? req.body : req.body.contacts;
    if (!Array.isArray(contacts)) throw new AppError('contacts array required', 400);
    const results = [];
    for (const contact of contacts) {
      if (contact.id) {
        const updated = await prisma.supportContact.update({
          where: { id: contact.id },
          data: contact,
        });
        results.push(updated);
      } else {
        const created = await prisma.supportContact.create({
          data: contact,
        });
        results.push(created);
      }
    }
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
});

module.exports = router;
