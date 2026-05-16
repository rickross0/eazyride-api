// ============================================================
// Seed Data — EazyRide + Haye! v3.0.0
// ============================================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database for v3.0.0...');

  // Super Admin
  const adminUser = await prisma.user.upsert({
    where: { phone: '+252615551001' },
    update: {},
    create: {
      phone: '+252615551001', email: 'admin@eazyride.com',
      password: await bcrypt.hash('admin123', 12),
      firstName: 'Super', lastName: 'Admin', role: 'ADMIN', isActive: true, isVerified: true,
      adminProfile: { create: { adminRole: 'SUPER_ADMIN', permissions: {} } },
      wallet: { create: { balance: 0 } },
    },
  });

  // Test Rider
  const riderUser = await prisma.user.upsert({
    where: { phone: '+252615550002' },
    update: {},
    create: {
      phone: '+252615550002', email: 'customer@test.com',
      password: await bcrypt.hash('test123', 12),
      firstName: 'Test', lastName: 'Rider', role: 'RIDER', isActive: true, isVerified: true,
      riderProfile: { create: { totalRides: 0, totalSpent: 0, rating: 5.0 } },
      wallet: { create: { balance: 100 } },
    },
  });

  // Test Driver
  const driverUser = await prisma.user.upsert({
    where: { phone: '+252615550003' },
    update: {},
    create: {
      phone: '+252615550003', email: 'driver@test.com',
      password: await bcrypt.hash('test123', 12),
      firstName: 'Test', lastName: 'Driver', role: 'DRIVER', isActive: true, isVerified: true,
      driverProfile: { create: { vehicleType: 'sedan', vehiclePlate: 'SL-1234', status: 'APPROVED', isOnline: false, canDeliver: true, rating: 5.0 } },
      wallet: { create: { balance: 0 } },
    },
  });

  // Test Store Owner
  const storeOwnerUser = await prisma.user.upsert({
    where: { phone: '+252615550004' },
    update: {},
    create: {
      phone: '+252615550004', email: 'store@test.com',
      password: await bcrypt.hash('test123', 12),
      firstName: 'Test', lastName: 'StoreOwner', role: 'STORE_OWNER', isActive: true, isVerified: true,
      wallet: { create: { balance: 0 } },
    },
  });

  // Test Provider
  const providerUser = await prisma.user.upsert({
    where: { phone: '+252615550005' },
    update: {},
    create: {
      phone: '+252615550005', email: 'provider@test.com',
      password: await bcrypt.hash('test123', 12),
      firstName: 'Test', lastName: 'Provider', role: 'SERVICE_PROVIDER', isActive: true, isVerified: true,
      providerProfile: { create: { businessName: 'Haye Cars', category: 'car_rental', phone: '+252615550005', isApproved: true, commissionRate: 5 } },
      wallet: { create: { balance: 0 } },
    },
  });

  // Default Fare Settings
  const fareSettings = [
    { vehicleType: 'sedan', baseFare: 1.5, perKmRate: 0.5, perMinuteRate: 0.08, minimumFare: 3, surgeMultiplier: 1 },
    { vehicleType: 'suv', baseFare: 2.5, perKmRate: 0.8, perMinuteRate: 0.1, minimumFare: 5, surgeMultiplier: 1 },
    { vehicleType: 'van', baseFare: 3.0, perKmRate: 1.0, perMinuteRate: 0.12, minimumFare: 6, surgeMultiplier: 1 },
  ];
  for (const fs of fareSettings) {
    await prisma.fareSetting.upsert({
      where: { vehicleType: fs.vehicleType },
      update: {},
      create: fs,
    });
  }

  // Sample Store
  const store = await prisma.store.create({
    data: {
      name: 'Hilib Geel Restaurant', description: 'Best Somali food in town',
      phone: '+252615550010', address: 'Mogadishu, Somalia',
      coordinates: { lat: 2.0469, lng: 45.3182 }, category: 'somali',
      deliveryFee: 1.0, minOrder: 3, isOpen: true, isActive: true, rating: 4.5,
      ownerId: (await prisma.storeOwnerProfile.findUnique({ where: { userId: storeOwnerUser.id } }))?.id || '',
    },
  });

  // Support Contacts
  const contacts = [
    { type: 'PHONE', label: 'Customer Care', value: '+252615551000', isActive: true },
    { type: 'WHATSAPP', label: 'WhatsApp Support', value: '+252615551000', isActive: true },
    { type: 'EMAIL', label: 'Email Support', value: 'support@eazyride.com', isActive: true },
  ];
  for (const c of contacts) {
    await prisma.supportContact.create({ data: c });
  }

  // Legal Documents
  await prisma.legalDocument.upsert({
    where: { type: 'TERMS' },
    update: { version: '3.0.0' },
    create: { type: 'TERMS', content: 'EazyRide + Haye! Terms and Conditions v3.0.0', version: '3.0.0' },
  });
  await prisma.legalDocument.upsert({
    where: { type: 'PRIVACY' },
    update: { version: '3.0.0' },
    create: { type: 'PRIVACY', content: 'EazyRide + Haye! Privacy Policy v3.0.0', version: '3.0.0' },
  });
  await prisma.legalDocument.upsert({
    where: { type: 'ABOUT' },
    update: { version: '3.0.0' },
    create: { type: 'ABOUT', content: 'EazyRide + Haye! — The Premium Super-App for Somalia. "Fast & Safe" • "The Answer For All"', version: '3.0.0' },
  });

  console.log('✅ Seed completed for v3.0.0');
  console.log(`  Admin: admin@eazyride.com / admin123`);
  console.log(`  Rider: customer@test.com / test123`);
  console.log(`  Driver: driver@test.com / test123`);
  console.log(`  Store Owner: store@test.com / test123`);
  console.log(`  Provider: provider@test.com / test123`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
