// ============================================================
// Seed Data — EazyRide + Haye! v3.0.0
// ============================================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database for v3.0.0...');

  // ── USERS ──
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

  // Store Owners
  const storeOwnersData = [
    { phone: '+252615550004', name: 'Hilib Geel', email: 'store1@test.com' },
    { phone: '+252615550006', name: 'Mogadishu Pizza', email: 'store2@test.com' },
    { phone: '+252615550007', name: 'Banadir Coffee', email: 'store3@test.com' },
  ];
  const storeOwnerUsers = [];
  for (const so of storeOwnersData) {
    const u = await prisma.user.upsert({
      where: { phone: so.phone },
      update: {},
      create: {
        phone: so.phone, email: so.email,
        password: await bcrypt.hash('test123', 12),
        firstName: so.name, lastName: 'Owner', role: 'STORE_OWNER', isActive: true, isVerified: true,
        storeOwnerProfile: { create: {} },
        wallet: { create: { balance: 0 } },
      },
    });
    storeOwnerUsers.push(u);
  }

  // Service Providers
  const providersData = [
    { phone: '+252615550005', name: 'Haye Cars', email: 'provider1@test.com', category: 'car_rental', address: 'Airport Road, Mogadishu' },
    { phone: '+252615550008', name: 'CleanPro', email: 'provider2@test.com', category: 'cleaning', address: 'Hodan District, Mogadishu' },
    { phone: '+252615550009', name: 'QuickFix Plumbing', email: 'provider3@test.com', category: 'plumbing', address: 'Waberi District, Mogadishu' },
    { phone: '+252615550011', name: 'Spark Electric', email: 'provider4@test.com', category: 'electrical', address: 'Hamarweyne, Mogadishu' },
  ];
  const providerUsers = [];
  for (const p of providersData) {
    const u = await prisma.user.upsert({
      where: { phone: p.phone },
      update: {},
      create: {
        phone: p.phone, email: p.email,
        password: await bcrypt.hash('test123', 12),
        firstName: p.name.split(' ')[0], lastName: p.name.split(' ').slice(1).join(' ') || 'Services',
        role: 'SERVICE_PROVIDER', isActive: true, isVerified: true,
        providerProfile: {
          create: {
            businessName: p.name,
            category: p.category,
            phone: p.phone,
            address: p.address,
            isApproved: true,
            commissionRate: 5,
            description: `${p.name} — professional ${p.category.replace('_', ' ')} services in Mogadishu.`,
          }
        },
        wallet: { create: { balance: 0 } },
      },
    });
    providerUsers.push(u);
  }

  // ── FARE SETTINGS ──
  const fareSettings = [
    { vehicleType: 'sedan', baseFare: 1.5, perKmRate: 0.5, perMinuteRate: 0.08, minimumFare: 3, surgeMultiplier: 1 },
    { vehicleType: 'suv', baseFare: 2.5, perKmRate: 0.8, perMinuteRate: 0.1, minimumFare: 5, surgeMultiplier: 1 },
    { vehicleType: 'van', baseFare: 3.0, perKmRate: 1.0, perMinuteRate: 0.12, minimumFare: 6, surgeMultiplier: 1 },
    { vehicleType: 'BAJAJ', baseFare: 0.8, perKmRate: 0.3, perMinuteRate: 0.05, minimumFare: 1.5, surgeMultiplier: 1 },
    { vehicleType: 'CAR', baseFare: 1.5, perKmRate: 0.5, perMinuteRate: 0.08, minimumFare: 3.0, surgeMultiplier: 1 },
  ];
  for (const fs of fareSettings) {
    await prisma.fareSetting.upsert({ where: { vehicleType: fs.vehicleType }, update: {}, create: fs });
  }

  // ── STORES ──
  const storesData = [
    {
      name: 'Hilib Geel Restaurant',
      description: 'Best Somali food in town. Authentic flavors since 2010.',
      phone: '+252615550010', address: 'Shangani District, Mogadishu, Somalia',
      coordinates: { lat: 2.0469, lng: 45.3182 }, category: 'somali', cuisine: 'Somali',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80',
      coverImageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80',
      deliveryFee: 1.0, minOrder: 3, openingTime: '07:00', closingTime: '22:00',
      rating: 4.5, ownerIndex: 0,
      categories: ['Main Dishes', 'Sides & Drinks'],
      items: [
        { name: 'Hilib Geel (Goat Meat)', desc: 'Tender goat meat slow-cooked with Somali spices', price: 8.0, catIdx: 0, popular: true, spicy: true, time: 20, img: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&q=80' },
        { name: 'Bariis Iskukaris', desc: 'Fragrant Somali rice with tender meat and vegetables', price: 6.5, catIdx: 0, popular: true, time: 15, img: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80' },
        { name: 'Suqaar (Beef Stir-fry)', desc: 'Diced beef with onions, peppers and xawaash', price: 7.0, catIdx: 0, time: 18, img: 'https://images.unsplash.com/photo-1543339308-43e59d6b8a22?w=400&q=80' },
        { name: 'Malawax (Sweet Pancakes)', desc: 'Light Somali pancakes served with honey and ghee', price: 3.0, catIdx: 1, time: 10, img: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24775?w=400&q=80' },
        { name: 'Shaah (Somali Tea)', desc: 'Traditional spiced black tea with milk and cardamom', price: 1.5, catIdx: 1, time: 5, img: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&q=80' },
        { name: 'Mango Juice', desc: 'Freshly blended sweet mango juice', price: 2.5, catIdx: 1, time: 3, img: 'https://images.unsplash.com/photo-1546173159-315724a3166d?w=400&q=80' },
      ],
    },
    {
      name: 'Mogadishu Pizza House',
      description: 'Fresh oven-baked pizzas, pasta and Italian classics delivered hot.',
      phone: '+252615550012', address: 'Hodan District, Mogadishu, Somalia',
      coordinates: { lat: 2.0420, lng: 45.3250 }, category: 'pizza', cuisine: 'Italian',
      imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d8d53fe9?w=800&q=80',
      coverImageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&q=80',
      deliveryFee: 1.5, minOrder: 5, openingTime: '10:00', closingTime: '23:00',
      rating: 4.3, ownerIndex: 1,
      categories: ['Pizzas', 'Sides'],
      items: [
        { name: 'Margherita Pizza', desc: 'Classic tomato sauce, mozzarella and fresh basil', price: 7.0, catIdx: 0, popular: true, time: 20, img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d641?w=400&q=80' },
        { name: 'Pepperoni Pizza', desc: 'Tomato sauce, mozzarella and spicy pepperoni', price: 9.0, catIdx: 0, popular: true, time: 22, img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80' },
        { name: 'Chicken Alfredo Pasta', desc: 'Creamy alfredo sauce with grilled chicken', price: 8.5, catIdx: 0, time: 18, img: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&q=80' },
        { name: 'Garlic Bread', desc: 'Toasted bread with garlic butter and herbs', price: 2.5, catIdx: 1, time: 8, img: 'https://images.unsplash.com/photo-1573140247632-f900f087b0d0?w=400&q=80' },
        { name: 'Coca-Cola 1.5L', desc: 'Chilled Coca-Cola bottle', price: 2.0, catIdx: 1, time: 1, img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80' },
      ],
    },
    {
      name: 'Banadir Coffee Corner',
      description: 'Premium coffee, pastries and light bites in a cozy atmosphere.',
      phone: '+252615550013', address: 'Makka Al Mukarama, Mogadishu, Somalia',
      coordinates: { lat: 2.0380, lng: 45.3100 }, category: 'cafe', cuisine: 'Cafe',
      imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
      coverImageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80',
      deliveryFee: 0.8, minOrder: 2, openingTime: '06:00', closingTime: '20:00',
      rating: 4.7, ownerIndex: 2,
      categories: ['Coffee', 'Pastries'],
      items: [
        { name: 'Cappuccino', desc: 'Rich espresso with steamed milk and foam', price: 2.0, catIdx: 0, popular: true, time: 5, img: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80' },
        { name: 'Espresso', desc: 'Strong single-shot espresso', price: 1.5, catIdx: 0, time: 3, img: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&q=80' },
        { name: 'Croissant', desc: 'Buttery flaky French croissant', price: 2.0, catIdx: 1, time: 2, img: 'https://images.unsplash.com/photo-1555507036-ab1f6cd8c4d8?w=400&q=80' },
        { name: 'Chocolate Muffin', desc: 'Rich chocolate chip muffin', price: 2.5, catIdx: 1, popular: true, time: 2, img: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&q=80' },
        { name: 'Fresh Orange Juice', desc: 'Freshly squeezed orange juice', price: 2.0, catIdx: 0, time: 3, img: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&q=80' },
      ],
    },
  ];

  for (const sd of storesData) {
    const sop = await prisma.storeOwnerProfile.findUnique({ where: { userId: storeOwnerUsers[sd.ownerIndex].id } });
    let store = await prisma.store.findFirst({ where: { name: sd.name } });
    if (!store) {
      store = await prisma.store.create({
        data: {
          name: sd.name, description: sd.description,
          phone: sd.phone, address: sd.address,
          coordinates: sd.coordinates, category: sd.category, cuisine: sd.cuisine,
          imageUrl: sd.imageUrl, coverImageUrl: sd.coverImageUrl,
          deliveryFee: sd.deliveryFee, minOrder: sd.minOrder,
          openingTime: sd.openingTime, closingTime: sd.closingTime,
          isOpen: true, isActive: true, rating: sd.rating,
          ownerId: sop?.id || null,
        },
      });
    }
    if (sop && !sop.storeId) {
      await prisma.storeOwnerProfile.update({ where: { id: sop.id }, data: { storeId: store.id } });
    }

    const cats = [];
    for (let i = 0; i < sd.categories.length; i++) {
      let cat = await prisma.storeCategory.findFirst({ where: { name: sd.categories[i], storeId: store.id } });
      if (!cat) {
        cat = await prisma.storeCategory.create({ data: { name: sd.categories[i], storeId: store.id, sortOrder: i + 1 } });
      }
      cats.push(cat);
    }

    for (const mi of sd.items) {
      await prisma.menuItem.create({
        data: {
          name: mi.name, description: mi.desc, price: mi.price,
          categoryId: cats[mi.catIdx]?.id || null,
          storeId: store.id,
          isAvailable: true, isPopular: mi.popular || false, isSpicy: mi.spicy || false,
          preparationTime: mi.time, imageUrl: mi.img,
        },
      }).catch(() => {});
    }
  }

  // ── CARS ──
  const carProviders = providerUsers.filter((_, i) => providersData[i].category === 'car_rental');
  for (const pp of carProviders) {
    const ppRec = await prisma.providerProfile.findUnique({ where: { userId: pp.id } });
    if (!ppRec) continue;
    const cars = [
      {
        make: 'Toyota', model: 'Corolla', year: 2023, color: 'White',
        plateNumber: 'MOG-C101', vehicleType: 'sedan',
        pricePerHour: 3, pricePerDay: 25,
        seats: 5, fuelType: 'petrol', transmission: 'automatic',
        description: 'Comfortable sedan for city rides',
        features: JSON.stringify(['AC', 'Bluetooth', 'GPS', 'USB Charging']),
        imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3998e34c?w=800&q=80',
      },
      {
        make: 'Toyota', model: 'Hilux', year: 2022, color: 'Silver',
        plateNumber: 'MOG-H202', vehicleType: 'suv',
        pricePerHour: 5, pricePerDay: 40,
        seats: 5, fuelType: 'diesel', transmission: 'manual',
        description: 'Rugged pickup for off-road and cargo',
        features: JSON.stringify(['4x4', 'AC', 'Tow Hitch', 'Roof Rack']),
        imageUrl: 'https://images.unsplash.com/photo-1550564950-6f0e7e5c8c3b?w=800&q=80',
      },
      {
        make: 'Nissan', model: 'Sunny', year: 2021, color: 'Black',
        plateNumber: 'MOG-S303', vehicleType: 'sedan',
        pricePerHour: 2.5, pricePerDay: 20,
        seats: 4, fuelType: 'petrol', transmission: 'automatic',
        description: 'Budget-friendly sedan for daily use',
        features: JSON.stringify(['AC', 'Radio', 'Power Windows']),
        imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db0?w=800&q=80',
      },
      {
        make: 'Hyundai', model: 'Tucson', year: 2024, color: 'Grey',
        plateNumber: 'MOG-T404', vehicleType: 'suv',
        pricePerHour: 6, pricePerDay: 50,
        seats: 5, fuelType: 'petrol', transmission: 'automatic',
        description: 'Modern SUV with panoramic roof and leather seats',
        features: JSON.stringify(['Panoramic Roof', 'Leather Seats', 'GPS', 'Reverse Camera', 'AC']),
        imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80',
      },
      {
        make: 'Mercedes', model: 'Vito', year: 2023, color: 'Black',
        plateNumber: 'MOG-V505', vehicleType: 'van',
        pricePerHour: 8, pricePerDay: 70,
        seats: 8, fuelType: 'diesel', transmission: 'automatic',
        description: 'Luxury van for group travel and airport transfers',
        features: JSON.stringify(['Leather Seats', 'AC', 'USB Charging', 'Tinted Windows', 'Mini Fridge']),
        imageUrl: 'https://images.unsplash.com/photo-1566008885218-90abf9200ddb?w=800&q=80',
      },
    ];
    for (const c of cars) {
      await prisma.car.upsert({
        where: { plateNumber: c.plateNumber },
        update: {},
        create: { ...c, providerId: ppRec.id, isAvailable: true, isVerified: true },
      }).catch(() => {});
    }
  }

  // ── SUPPORT CONTACTS ──
  const contacts = [
    { type: 'PHONE', label: 'Customer Care', value: '+252615551000', isActive: true },
    { type: 'WHATSAPP', label: 'WhatsApp Support', value: '+252615551000', isActive: true },
    { type: 'EMAIL', label: 'Email Support', value: 'support@eazyride.com', isActive: true },
  ];
  for (const c of contacts) {
    await prisma.supportContact.create({ data: c }).catch(() => {});
  }

  // ── LEGAL DOCUMENTS ──
  await prisma.legalDocument.upsert({
    where: { type: 'TERMS' }, update: { version: '3.0.0' },
    create: { type: 'TERMS', content: 'EazyRide + Haye! Terms and Conditions v3.0.0', version: '3.0.0' },
  });
  await prisma.legalDocument.upsert({
    where: { type: 'PRIVACY' }, update: { version: '3.0.0' },
    create: { type: 'PRIVACY', content: 'EazyRide + Haye! Privacy Policy v3.0.0', version: '3.0.0' },
  });
  await prisma.legalDocument.upsert({
    where: { type: 'ABOUT' }, update: { version: '3.0.0' },
    create: { type: 'ABOUT', content: 'EazyRide + Haye! — The Premium Super-App for Somalia. "Fast & Safe" • "The Answer For All"', version: '3.0.0' },
  });

  console.log('✅ Seed completed for v3.0.0');
  console.log(`  Admin:    admin@eazyride.com / admin123`);
  console.log(`  Rider:    customer@test.com / test123`);
  console.log(`  Driver:   driver@test.com / test123`);
  console.log(`  Stores:   ${storesData.length} restaurants with menu items`);
  console.log(`  Cars:     5 rental cars`);
  console.log(`  Providers: ${providersData.length} service providers`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
