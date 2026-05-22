const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminController');
const { authMiddleware, roleMiddleware, adminMinLevel, attachUser } = require('../middleware/auth');

// ── Permission Map ──────────────────────────────────────────
// SUPER (3):  Full access — everything
// MANAGER (2): Users, Drivers, Rides, Orders, Restaurants, Providers, Cars, Reports
//              Cannot: Pricing, Surge, Payouts (complete), Feature toggles, Commissions
// CARE (1):   View + approve drivers, view/suspend/activate users, view rides/orders
//              Cannot: Everything else

// ── Users & Drivers (MANAGER+) ─────────────────────────────
router.get('/users', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('CARE'), adminCtrl.listUsers);
router.get('/drivers', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('CARE'), adminCtrl.listDrivers);
router.put('/drivers/:id/approve', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('CARE'), adminCtrl.approveDriver);
router.put('/users/:id/suspend', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('CARE'), adminCtrl.suspendUser);
router.put('/users/:id/activate', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('CARE'), adminCtrl.activateUser);

// ── Rides & Orders (CARE+) ─────────────────────────────────
router.get('/rides', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('CARE'), adminCtrl.listRides);
router.get('/orders', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('CARE'), adminCtrl.listOrders);

// ── Online Drivers (CARE+) ─────────────────────────────────
router.get('/online-drivers', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('CARE'), adminCtrl.listOnlineDrivers);

// ── Restaurants (MANAGER+) ──────────────────────────────────
router.get('/restaurants', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('MANAGER'), adminCtrl.listRestaurants);

// ── Providers & Cars (MANAGER+) ─────────────────────────────
router.get('/providers', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('MANAGER'), adminCtrl.listProviders);
router.get('/provider-earnings', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('MANAGER'), adminCtrl.listProviderEarnings);

// ── Reports (MANAGER+) ──────────────────────────────────────
router.get('/reports', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('MANAGER'), adminCtrl.getReportData);

// ── Feature Toggles (SUPER only) ────────────────────────────
router.get('/features', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('SUPER'), adminCtrl.getFeatureToggles);
router.post('/features', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('SUPER'), adminCtrl.setFeatureToggle);

// ── Pricing (SUPER only) ────────────────────────────────────
router.get('/pricing', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('SUPER'), adminCtrl.getPricing);

// ── Surge Zones (SUPER only) ────────────────────────────────
router.get('/surge-zones', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('SUPER'), adminCtrl.listSurgeZones);
router.post('/surge-zones', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('SUPER'), adminCtrl.createSurgeZone);
router.put('/surge-zones/:id', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('SUPER'), adminCtrl.updateSurgeZone);
router.delete('/surge-zones/:id', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('SUPER'), adminCtrl.deleteSurgeZone);

// ── Payouts (SUPER only) ────────────────────────────────────
router.get('/payouts', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('CARE'), adminCtrl.listPayouts);
router.put('/payouts/:id/complete', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('CARE'), adminCtrl.completePayout);

// ── Commissions (SUPER only) ────────────────────────────────
router.post('/commissions', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('SUPER'), adminCtrl.setCommission);


// ── Staff Management (SUPER only) ────────────────────────────
router.get('/staff', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('SUPER'), adminCtrl.listStaff);
router.post('/staff', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('SUPER'), adminCtrl.createStaff);
router.put('/staff/:id/role', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('SUPER'), adminCtrl.updateStaffRole);
router.delete('/staff/:id', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('SUPER'), adminCtrl.deleteStaff);

// ── Activity Log (SUPER only) ────────────────────────────────
router.get('/activity-log', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('SUPER'), adminCtrl.listActivityLog);

// ── Master Login (SUPER only) ────────────────────────────────
router.post('/master-login', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('SUPER'), adminCtrl.masterLogin);

// ── API Settings (SUPER only) ─────────────────────────────────
router.get('/api-settings', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('SUPER'), adminCtrl.listApiSettings);
router.post('/api-settings', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('SUPER'), adminCtrl.upsertApiSetting);
router.delete('/api-settings/:id', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('SUPER'), adminCtrl.deleteApiSetting);

// ── WaafiPay Test (SUPER only) ────────────────────────────────
router.post('/test-waafi', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('SUPER'), adminCtrl.testWaafiPay);

// ── Permission Definitions (SUPER only) ─────────────────────────
router.get('/permission-definitions', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('SUPER'), adminCtrl.getPermissionDefinitions);

// ── Staff Permissions (SUPER only) ──────────────────────────────
router.get('/staff/permissions', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('SUPER'), adminCtrl.listStaffWithPermissions);
router.get('/staff/:id/permissions', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('SUPER'), adminCtrl.listStaffPermissions);
router.put('/staff/:id/permissions', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('SUPER'), adminCtrl.grantPermissions);
router.delete('/staff/:id/permissions', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('SUPER'), adminCtrl.revokeAllPermissions);

// ── Demand Heatmap (MANAGER+) ──────────────────────────────────────
router.get('/demand-heatmap', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('MANAGER'), adminCtrl.getDemandHeatmap);

// ── PDF Report Generation (MANAGER+) ────────────────────────────────
router.get('/reports/pdf', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('MANAGER'), adminCtrl.generateRideReportPDF);

// ── Payout Approval Tiers ────────────────────────────────────────
// >$200 requires CARE (Staff), >$1000 requires MANAGER, >$1500 requires SUPER
router.put('/payouts/:id/reject', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('CARE'), adminCtrl.rejectPayout);

// ── Cars Management (MANAGER+) ─────────────────────────────
router.get('/cars', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('MANAGER'), adminCtrl.listCars);

// ── Admin Settings (MANAGER+) ──────────────────────────────
router.get('/settings', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('MANAGER'), async (req, res) => {
  try {
    const prisma = require('../config/prisma');
    const settings = await prisma.adminSetting.findMany({ orderBy: { key: 'asc' } });
    return res.json({ settings });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.post('/settings', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('MANAGER'), async (req, res) => {
  try {
    const prisma = require('../config/prisma');
    const { key, value, label } = req.body;
    if (!key || value === undefined) return res.status(400).json({ error: 'key and value required' });
    const setting = await prisma.adminSetting.upsert({
      where: { key },
      update: { value, label },
      create: { key, value, label },
    });
    return res.json({ setting });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save setting' });
  }
});

// ── SOS Alerts (CARE+) ─────────────────────────────────────
const sosRoutes = require('../routes/sos');
router.use('/sos', sosRoutes);

// ── Provider Approve (MANAGER+) ──────────────────────────────
router.put('/providers/:id/approve', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('MANAGER'), adminCtrl.approveProvider);

// ── Provider Commission Update (SUPER only) ──────────────────
router.put('/providers/:id/commission', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('SUPER'), adminCtrl.updateProviderCommission);

// ── Car Verify (MANAGER+) ────────────────────────────────────
router.put('/cars/:id/verify', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('MANAGER'), adminCtrl.verifyCar);


// ── Admin Reset User Password (SUPER only) ──────────────────
router.put("/users/:id/reset-password", authMiddleware, roleMiddleware("ADMIN", "SUPER_ADMIN"), adminMinLevel("SUPER"), adminCtrl.resetUserPassword);

// ── Admin Change User Role (SUPER only) ──────────────────────
router.put("/users/:id/role", authMiddleware, roleMiddleware("ADMIN", "SUPER_ADMIN"), adminMinLevel("SUPER"), adminCtrl.changeUserRole);

// ── Admin Delete User (SUPER only) ──────────────────────────
router.delete("/users/:id", authMiddleware, roleMiddleware("ADMIN", "SUPER_ADMIN"), adminMinLevel("SUPER"), adminCtrl.deleteUser);


// ── Legal: T&C Management (SUPER only) ──────────────────────
const legalCtrl = require('../controllers/legalController');
router.put('/legal/terms', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('SUPER'), legalCtrl.updateTerms);

// ── Support Contacts Management (SUPER only) ──────────────────
const supportCtrl = require('../controllers/supportController');
router.put('/support/contacts', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('SUPER'), supportCtrl.updateContacts);

// ── Provider Category Update (MANAGER+) ──────────────────────
router.put('/providers/:id/category', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('MANAGER'), async (req, res) => {
  try {
    const prisma = require('../config/prisma');
    const { providerType } = req.body;
    if (!providerType) return res.status(400).json({ error: 'providerType required' });
    const provider = await prisma.serviceProvider.update({
      where: { id: req.params.id },
      data: { category: providerType },
    });
    return res.json({ provider });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update provider category' });
  }
});
module.exports = router;

// ── Custom Admin Roles (SUPER only) ───────────────────────────
router.get('/custom-roles', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('SUPER'), adminCtrl.getCustomRoles);
router.post('/custom-roles', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('SUPER'), adminCtrl.createCustomRole);
router.put('/custom-roles/:key', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('SUPER'), adminCtrl.updateCustomRole);
router.delete('/custom-roles/:key', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), adminMinLevel('SUPER'), adminCtrl.deleteCustomRole);
