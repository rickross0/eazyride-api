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

  // Test Store Owner (with profile)
  const storeOwnerUser = await prisma.user.upsert({
    where: { phone: '+252615550004' },
    update: {},
    create: {
      phone: '+252615550004', email: 'store@test.com',
      password: await bcrypt.hash('test123', 12),
      firstName: 'Test', lastName: 'StoreOwner', role: 'STORE_OWNER', isActive: true, isVerified: true,
      storeOwnerProfile: { create: {} },
      wallet: { create: { balance: 0 } },
    },
  });

  // Test Provider (with profile)
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
    { vehicleType: 'BAJAJ', baseFare: 0.8, perKmRate: 0.3, perMinuteRate: 0.05, minimumFare: 1.5, surgeMultiplier: 1 },
    { vehicleType: 'CAR', baseFare: 1.5, perKmRate: 0.5, perMinuteRate: 0.08, minimumFare: 3.0, surgeMultiplier: 1 },
  ];
  for (const fs of fareSettings) {
    await prisma.fareSetting.upsert({
      where: { vehicleType: fs.vehicleType },
      update: {},
      create: fs,
    });
  }

  // ── STORE: Hilib Geel Restaurant ──
  const sop = await prisma.storeOwnerProfile.findUnique({ where: { userId: storeOwnerUser.id } });
  const store = await prisma.store.upsert({
    where: { name: 'Hilib Geel Restaurant' },
    update: {},
    create: {
      name: 'Hilib Geel Restaurant',
      description: 'Best Somali food in town',
      phone: '+252615550010',
      address: 'Mogadishu, Somalia',
      coordinates: { lat: 2.0469, lng: 45.3182 },
      category: 'somali',
      deliveryFee: 1.0, minOrder: 3,
      isOpen: true, isActive: true, rating: 4.5,
      ownerId: sop?.id || undefined,
    },
  });

  // Link store back to owner profile
  if (sop && !sop.storeId) {
    await prisma.storeOwnerProfile.update({ where: { id: sop.id }, data: { storeId: store.id } });
  }

  // Store Categories
  const catMain = await prisma.storeCategory.upsert({
    where: { id: 'cat-main-dishes' },
    update: {},
    create: { name: 'Main Dishes', storeId: store.id, sortOrder: 1 },
  });
  const catSides = await prisma.storeCategory.upsert({
    where: { id: 'cat-sides' },
    update: {},
    create: { name: 'Sides & Drinks', storeId: store.id, sortOrder: 2 },
  });

  // Menu Items
  const menuItems = [
    { name: 'Hilib Geel (Goat Meat)', description: 'Tender goat meat with spices', price: 8.0, categoryId: catMain.id, isPopular: true, isSpicy: true, preparationTime: 20 },
    { name: 'Bariis Iskukaris', description: 'Somali rice with meat and vegetables', price: 6.5, categoryId: catMain.id, isPopular: true, preparationTime: 15 },
    { name: 'Suqaar (Beef Stir-fry)', description: 'Diced beef with onions and peppers', price: 7.0, categoryId: catMain.id, preparationTime: 18 },
    { name: 'Malawax (Sweet Pancakes)', description: 'Somali sweet pancakes with honey', price: 3.0, categoryId: catSides.id, preparationTime: 10 },
    { name: 'Shaah (Somali Tea)', description: 'Traditional spiced tea with milk', price: 1.5, categoryId: catSides.id, preparationTime: 5 },
    { name: 'Mango Juice', description: 'Fresh mango juice', price: 2.5, categoryId: catSides.id, preparationTime: 3 },
  ];
  for (const mi of menuItems) {
    await prisma.menuItem.upsert({
      where: { id: `menu-${mi.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}` },
      update: {},
      create: { ...mi, storeId: store.id, isAvailable: true },
    });
  }

  // ── CAR RENTAL: Sample Cars ──
  const pp = await prisma.providerProfile.findUnique({ where: { userId: providerUser.id } });
  if (pp) {
    const cars = [
      {
        make: 'Toyota', model: 'Corolla', year: 2023, color: 'White',
        plateNumber: 'MOG-C101', vehicleType: 'sedan',
        pricePerHour: 3, pricePerDay: 25,
        seats: 5, fuelType: 'petrol', transmission: 'automatic',
        description: 'Comfortable sedan for city rides',
        features: ['AC', 'Bluetooth', 'GPS', 'USB Charging'],
      },
      {
        make: 'Toyota', model: 'Hilux', year: 2022, color: 'Silver',
        plateNumber: 'MOG-H202', vehicleType: 'suv',
        pricePerHour: 5, pricePerDay: 40,
        seats: 5, fuelType: 'diesel', transmission: 'manual',
        description: 'Rugged pickup for off-road and cargo',
        features: ['4x4', 'AC', 'Tow Hitch', 'Roof Rack'],
      },
      {
        make: 'Nissan', model: 'Sunny', year: 2021, color: 'Black',
        plateNumber: 'MOG-S303', vehicleType: 'sedan',
        pricePerHour: 2.5, pricePerDay: 20,
        seats: 4, fuelType: 'petrol', transmission: 'automatic',
        description: 'Budget-friendly sedan for daily use',
        features: ['AC', 'Radio', 'Power Windows'],
      },
    ];
    for (const c of cars) {
      await prisma.car.upsert({
        where: { plateNumber: c.plateNumber },
        update: {},
        create: { ...c, providerId: pp.id, isAvailable: true, isVerified: true },
      });
    }
  }

  // Support Contacts
  const contacts = [
    { type: 'PHONE', label: 'Customer Care', value: '+252615551000', isActive: true },
    { type: 'WHATSAPP', label: 'WhatsApp Support', value: '+252615551000', isActive: true },
    { type: 'EMAIL', label: 'Email Support', value: 'support@eazyride.com', isActive: true },
  ];
  for (const c of contacts) {
    await prisma.supportContact.create({ data: c }).catch(() => {});
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
  console.log(`  Admin:    admin@eazyride.com / admin123`);
  console.log(`  Rider:    customer@test.com / test123`);
  console.log(`  Driver:   driver@test.com / test123`);
  console.log(`  Store:    store@test.com / test123`);
  console.log(`  Provider: provider@test.com / test123`);
  console.log(`  Store:    Hilib Geel Restaurant (6 menu items)`);
  console.log(`  Cars:     3 rental cars available`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
