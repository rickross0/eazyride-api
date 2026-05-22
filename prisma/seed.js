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
  let store = await prisma.store.findFirst({ where: { name: 'Hilib Geel Restaurant' } });
  if (!store) {
    store = await prisma.store.create({
      data: {
        name: 'Hilib Geel Restaurant',
        description: 'Best Somali food in town. Authentic flavors, fresh ingredients, and warm hospitality since 2010.',
        phone: '+252615550010',
        address: 'Shangani District, Mogadishu, Somalia',
        coordinates: { lat: 2.0469, lng: 45.3182 },
        category: 'somali',
        cuisine: 'Somali',
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
        coverImageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80',
        deliveryFee: 1.0, minOrder: 3,
        openingTime: '07:00', closingTime: '22:00',
        isOpen: true, isActive: true, rating: 4.5,
        ownerId: sop?.id || null,
      },
    });
  }

  // Link store back to owner profile
  if (sop && !sop.storeId) {
    await prisma.storeOwnerProfile.update({ where: { id: sop.id }, data: { storeId: store.id } });
  }

  // Store Categories
  let catMain = await prisma.storeCategory.findFirst({ where: { name: 'Main Dishes', storeId: store.id } });
  if (!catMain) {
    catMain = await prisma.storeCategory.create({ data: { name: 'Main Dishes', storeId: store.id, sortOrder: 1 } });
  }
  let catSides = await prisma.storeCategory.findFirst({ where: { name: 'Sides & Drinks', storeId: store.id } });
  if (!catSides) {
    catSides = await prisma.storeCategory.create({ data: { name: 'Sides & Drinks', storeId: store.id, sortOrder: 2 } });
  }

  // Menu Items
  const menuItems = [
    { name: 'Hilib Geel (Goat Meat)', description: 'Tender goat meat slow-cooked with Somali spices', price: 8.0, categoryId: catMain.id, isPopular: true, isSpicy: true, preparationTime: 20, imageUrl: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=80' },
    { name: 'Bariis Iskukaris', description: 'Fragrant Somali rice with tender meat and vegetables', price: 6.5, categoryId: catMain.id, isPopular: true, preparationTime: 15, imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80' },
    { name: 'Suqaar (Beef Stir-fry)', description: 'Diced beef with onions, peppers and xawaash', price: 7.0, categoryId: catMain.id, preparationTime: 18, imageUrl: 'https://images.unsplash.com/photo-1543339308-43e59d6b8a22?w=400&q=80' },
    { name: 'Malawax (Sweet Pancakes)', description: 'Light Somali pancakes served with honey and ghee', price: 3.0, categoryId: catSides.id, preparationTime: 10, imageUrl: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24775?w=400&q=80' },
    { name: 'Shaah (Somali Tea)', description: 'Traditional spiced black tea with milk and cardamom', price: 1.5, categoryId: catSides.id, preparationTime: 5, imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80' },
    { name: 'Mango Juice', description: 'Freshly blended sweet mango juice', price: 2.5, categoryId: catSides.id, preparationTime: 3, imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a3166d?w=400&q=80' },
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
        features: JSON.stringify(['AC', 'Bluetooth', 'GPS', 'USB Charging']),
      },
      {
        make: 'Toyota', model: 'Hilux', year: 2022, color: 'Silver',
        plateNumber: 'MOG-H202', vehicleType: 'suv',
        pricePerHour: 5, pricePerDay: 40,
        seats: 5, fuelType: 'diesel', transmission: 'manual',
        description: 'Rugged pickup for off-road and cargo',
        features: JSON.stringify(['4x4', 'AC', 'Tow Hitch', 'Roof Rack']),
      },
      {
        make: 'Nissan', model: 'Sunny', year: 2021, color: 'Black',
        plateNumber: 'MOG-S303', vehicleType: 'sedan',
        pricePerHour: 2.5, pricePerDay: 20,
        seats: 4, fuelType: 'petrol', transmission: 'automatic',
        description: 'Budget-friendly sedan for daily use',
        features: JSON.stringify(['AC', 'Radio', 'Power Windows']),
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
