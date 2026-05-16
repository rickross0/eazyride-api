const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware, attachUser } = require('../middleware/auth');
const prisma = require('../config/prisma');

// ── Provider Registration ──────────────────────────────────
router.post('/register', authMiddleware, attachUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { businessName, category, description, phone } = req.body;
    if (!businessName || !phone) return res.status(400).json({ error: 'businessName, phone required' });
    const existing = await prisma.serviceProvider.findUnique({ where: { userId } });
    if (existing) return res.status(409).json({ error: 'Provider already registered' });
    const provider = await prisma.serviceProvider.create({
      data: { userId, businessName, category: category || 'OTHER', description, phone },
    });
    res.status(201).json({ provider });
  } catch (err) {
    console.error('Provider register error:', err);
    res.status(500).json({ error: 'Failed to register provider' });
  }
});

// ── Get Current Provider Profile ──────────────────────────
router.get('/me/profile', authMiddleware, async (req, res) => {
  try {
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId: req.userId },
      include: { user: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } } },
    });
    if (!provider) return res.status(404).json({ error: 'No provider profile found' });
    res.json({ provider });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch provider profile' });
  }
});

// ── Update Current Provider Profile ────────────────────────
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const provider = await prisma.serviceProvider.findUnique({ where: { userId: req.userId } });
    if (!provider) return res.status(404).json({ error: 'No provider profile found' });

    const { businessName, description, phone, email, address, image, category, isAvailable } = req.body;
    const updated = await prisma.serviceProvider.update({
      where: { id: provider.id },
      data: {
        ...(businessName !== undefined && { businessName }),
        ...(description !== undefined && { description }),
        ...(phone !== undefined && { phone }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(category !== undefined && { category }),
      },
    });
    res.json({ provider: updated });
  } catch (err) {
    console.error('Update provider error:', err);
    res.status(500).json({ error: 'Failed to update provider profile' });
  }
});

// ── Provider Stats ─────────────────────────────────────────
router.get('/me/stats', authMiddleware, async (req, res) => {
  try {
    const provider = await prisma.serviceProvider.findUnique({ where: { userId: req.userId } });

    // Detect car-rental provider by profile category OR by owning cars
    const ownedCars = await prisma.car.findMany({ where: { ownerId: req.userId } });
    const isCarRental = provider?.category === 'CAR_RENTAL' || ownedCars.length > 0;

    if (isCarRental) {
      const [cars, reservations] = await Promise.all([
        Promise.resolve(ownedCars),
        prisma.rentalReservation.findMany({
          where: { car: { ownerId: req.userId } },
          orderBy: { createdAt: 'desc' },
        }),
      ]);
      const activeReservations = reservations.filter(r => ['PENDING', 'CONFIRMED'].includes(r.status)).length;
      const totalRevenue = reservations.filter(r => r.status === 'COMPLETED').reduce((sum, r) => sum + (r.totalAmount || 0), 0);
      res.json({
        providerType: provider?.category || 'CAR_RENTAL',
        totalCars: cars.length,
        activeReservations,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        pendingOrders: reservations.filter(r => r.status === 'PENDING').length,
      });
    } else if (provider) {
      // Service provider stats — leads + basic counts
      const leads = await prisma.serviceLead.findMany({
        where: { providerId: provider.id },
        orderBy: { createdAt: 'desc' },
      });
      const pendingLeads = leads.filter(l => l.status === 'PENDING').length;
      const acceptedLeads = leads.filter(l => l.status === 'ACCEPTED').length;
      const completedLeads = leads.filter(l => l.status === 'COMPLETED').length;
      res.json({
        providerType: provider.category,
        totalRequests: leads.length,
        pendingRequests: pendingLeads,
        acceptedRequests: acceptedLeads,
        completedRequests: completedLeads,
        newNotifications: pendingLeads,
      });
    } else {
      return res.status(404).json({ error: 'No provider profile found' });
    }
  } catch (err) {
    console.error('Provider stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});


// ── Provider Reservations (car-rental) ─────────────────────
router.get('/me/reservations', authMiddleware, async (req, res) => {
  try {
    const reservations = await prisma.rentalReservation.findMany({
      where: { car: { ownerId: req.userId } },
      include: { car: { select: { id: true, brand: true, model: true, plateNumber: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ reservations });
  } catch (err) {
    console.error('Provider reservations error:', err);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});
// ── Provider Cars (car-rental) ──────────────────────────────
router.get('/me/cars', authMiddleware, async (req, res) => {
  try {
    const cars = await prisma.car.findMany({
      where: { ownerId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { id: true, name: true } } },
    });
    res.json({ cars });
  } catch (err) {
    console.error('Provider cars error:', err);
    res.status(500).json({ error: 'Failed to fetch cars' });
  }
});


// ── Provider Leads (for non-car-rental providers) ──────────
router.get('/me/leads', authMiddleware, async (req, res) => {
  try {
    const provider = await prisma.serviceProvider.findUnique({ where: { userId: req.userId } });
    if (!provider) return res.status(404).json({ error: 'No provider profile found' });

    const leads = await prisma.serviceLead.findMany({
      where: { providerId: provider.id },
      include: { customer: { select: { id: true, firstName: true, lastName: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ leads });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// ── Accept/Reject a Lead ───────────────────────────────────
router.put('/me/leads/:id', authMiddleware, async (req, res) => {
  try {
    const { status, quotedPrice } = req.body;
    const provider = await prisma.serviceProvider.findUnique({ where: { userId: req.userId } });
    if (!provider) return res.status(404).json({ error: 'No provider profile found' });

    const lead = await prisma.serviceLead.findUnique({ where: { id: req.params.id } });
    if (!lead || lead.providerId !== provider.id) return res.status(404).json({ error: 'Lead not found' });

    const updateData = {};
    if (status === 'ACCEPTED') { updateData.status = 'ACCEPTED'; updateData.acceptedAt = new Date(); }
    else if (status === 'REJECTED') { updateData.status = 'REJECTED'; }
    else if (status === 'COMPLETED') { updateData.status = 'COMPLETED'; updateData.finalPrice = quotedPrice ? parseFloat(quotedPrice) : null; }
    else return res.status(400).json({ error: 'Invalid status. Use ACCEPTED, REJECTED, or COMPLETED' });

    if (quotedPrice) updateData.quotedPrice = parseFloat(quotedPrice);

    const updated = await prisma.serviceLead.update({ where: { id: req.params.id }, data: updateData });
    res.json({ lead: updated });
  } catch (err) {
    console.error('Lead update error:', err);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});


// ── Provider Cancellation Fee Rules ─────────────────────────
router.get('/me/cancellation-rules', authMiddleware, async (req, res) => {
  try {
    const provider = await prisma.serviceProvider.findUnique({ where: { userId: req.userId } });
    if (!provider) return res.status(404).json({ error: 'No provider profile found' });
    const rules = await prisma.cancellationFeeRule.findMany({
      where: { providerId: provider.id },
      orderBy: { hoursBefore: 'desc' },
    });
    res.json({ rules });
  } catch (err) {
    console.error('Cancellation rules fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch cancellation rules' });
  }
});

router.post('/me/cancellation-rules', authMiddleware, async (req, res) => {
  try {
    const provider = await prisma.serviceProvider.findUnique({ where: { userId: req.userId } });
    if (!provider) return res.status(404).json({ error: 'No provider profile found' });

    const { rules } = req.body; // Array of { label, hoursBefore, feePercent }
    if (!Array.isArray(rules) || rules.length === 0) {
      return res.status(400).json({ error: 'rules array is required' });
    }

    // Delete existing rules and replace
    await prisma.cancellationFeeRule.deleteMany({ where: { providerId: provider.id } });

    const created = await prisma.cancellationFeeRule.createMany({
      data: rules.map((r) => ({
        providerId: provider.id,
        label: r.label,
        hoursBefore: parseInt(r.hoursBefore),
        feePercent: parseFloat(r.feePercent),
        isActive: r.isActive !== false,
      })),
    });

    const newRules = await prisma.cancellationFeeRule.findMany({
      where: { providerId: provider.id },
      orderBy: { hoursBefore: 'desc' },
    });
    res.json({ rules: newRules });
  } catch (err) {
    console.error('Cancellation rules save error:', err);
    res.status(500).json({ error: 'Failed to save cancellation rules' });
  }
});

router.delete('/me/cancellation-rules/:id', authMiddleware, async (req, res) => {
  try {
    const provider = await prisma.serviceProvider.findUnique({ where: { userId: req.userId } });
    if (!provider) return res.status(404).json({ error: 'No provider profile found' });

    const rule = await prisma.cancellationFeeRule.findUnique({ where: { id: req.params.id } });
    if (!rule || rule.providerId !== provider.id) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    await prisma.cancellationFeeRule.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Cancellation rule delete error:', err);
    res.status(500).json({ error: 'Failed to delete rule' });
  }
});

// ── Provider Payouts ────────────────────────────────────────
router.get('/me/payouts', authMiddleware, async (req, res) => {
  try {
    const payouts = await prisma.payoutRecord.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json({ payouts });
  } catch (err) {
    // PayoutRecord may not exist yet - return empty
    res.json({ payouts: [] });
  }
});

router.post('/me/payouts', authMiddleware, async (req, res) => {
  try {
    const provider = await prisma.serviceProvider.findUnique({ where: { userId: req.userId } });
    if (!provider) return res.status(404).json({ error: 'No provider profile found' });

    // Get available balance from wallet
    const wallet = await prisma.wallet.findUnique({ where: { userId: req.userId } });
    if (!wallet || wallet.balance <= 0) {
      return res.status(400).json({ error: 'No available balance for payout' });
    }

    const amount = wallet.balance;
    const payout = await prisma.payoutRecord.create({
      data: {
        userId: req.userId,
        amount,
        method: 'WALLET',
        status: 'PENDING',
      },
    });

    // Deduct from wallet
    await prisma.wallet.update({
      where: { userId: req.userId },
      data: { balance: 0 },
    });

    await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        type: 'WITHDRAWAL',
        amount,
        balanceBefore: amount,
        balanceAfter: 0,
        description: 'Payout request',
        referenceId: payout.id,
      },
    });

    res.json({ payout });
  } catch (err) {
    console.error('Payout request error:', err);
    res.status(500).json({ error: 'Failed to request payout' });
  }
});

// ── Admin Routes ───────────────────────────────────────────
router.get('/', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const providers = await prisma.serviceProvider.findMany({ include: { user: { select: { id: true, firstName: true, lastName: true, phone: true } } } });
    res.json({ providers });
  } catch (err) { res.status(500).json({ error: 'Failed to list providers' }); }
});

router.put('/:id/commission', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { commissionRate } = req.body;
    if (commissionRate === undefined) return res.status(400).json({ error: 'commissionRate required' });
    const provider = await prisma.serviceProvider.update({ where: { id: req.params.id }, data: { commissionRate: parseFloat(commissionRate) } });
    res.json({ provider });
  } catch (err) { res.status(500).json({ error: 'Failed to set commission' }); }
});

router.put('/:id/approve', authMiddleware, roleMiddleware('ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const provider = await prisma.serviceProvider.update({ where: { id: req.params.id }, data: { isVerified: true } });
    res.json({ provider });
  } catch (err) { res.status(500).json({ error: 'Failed to approve provider' }); }
});

module.exports = router;
