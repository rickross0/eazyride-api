// ============================================================
// Seed Script: Test Stores & Menu Items for EazyRide Haye!
// Run: node scripts/seed-stores.js
// Requires: DATABASE_URL env var set
// ============================================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const STORE_IMAGES = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800',
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
  'https://images.unsplash.com/photo-1560611588-163f295eb145?w=800',
];

const FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
  'https://images.unsplash.com/photo-1561758033-d89a9eb2947c?w=400',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
  'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=400',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
  'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400',
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
  'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400',
  'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
];

const STORES = [
  { name: 'Al-Baraka Restaurant', category: 'Somali', cuisine: 'Somali', description: 'Authentic Somali cuisine since 2010', address: 'Bakaara Market, Mogadishu', phone: '+252612345001', deliveryFee: 1.50 },
  { name: 'Haye! Burger Joint', category: 'Fast Food', cuisine: 'Fast Food', description: 'Juicy burgers and crispy fries', address: 'Maka Al-Mukarama Road', phone: '+252612345002', deliveryFee: 1.00 },
  { name: 'Mogadishu Pizza House', category: 'Pizza', cuisine: 'Pizza', description: 'Wood-fired Italian pizza', address: 'KM4 Junction', phone: '+252612345003', deliveryFee: 2.00 },
  { name: 'Safari Coffee Co.', category: 'Coffee', cuisine: 'Coffee', description: 'Premium Somali coffee and pastries', address: 'Aden Adde International Airport Road', phone: '+252612345004', deliveryFee: 0.80 },
  { name: 'Banaadir Juice Bar', category: 'Juice', cuisine: 'Juice', description: 'Fresh tropical juices and smoothies', address: 'Lido Beach Road', phone: '+252612345005', deliveryFee: 0.80 },
];

const MENU_ITEMS = [
  [
    { name: 'Goat Meat Suqaar', description: 'Tender goat meat sautéed with Somali spices', price: 8.00, category: 'Main' },
    { name: 'Canjeero Breakfast', description: 'Somali pancakes with honey and sesame oil', price: 4.50, category: 'Breakfast' },
    { name: 'Maraq Soup', description: 'Traditional Somali spiced soup', price: 3.00, category: 'Soup' },
    { name: 'Bariis & Hilib', description: 'Somali rice with seasoned lamb', price: 10.00, category: 'Main' },
  ],
  [
    { name: 'Classic Beef Burger', description: 'Double patty with cheese and secret sauce', price: 6.50, category: 'Burgers' },
    { name: 'Crispy Chicken Wings', description: '8 pieces with spicy or mild coating', price: 7.00, category: 'Wings' },
    { name: 'Loaded Fries', description: 'Fries topped with cheese, bacon, and jalapeños', price: 4.00, category: 'Sides' },
    { name: 'Milkshake', description: 'Vanilla, chocolate, or strawberry', price: 3.50, category: 'Drinks' },
  ],
  [
    { name: 'Margherita Pizza', description: 'Tomato sauce, mozzarella, fresh basil', price: 9.00, category: 'Classic' },
    { name: 'Pepperoni Feast', description: 'Double pepperoni with extra cheese', price: 11.00, category: 'Meat' },
    { name: 'BBQ Chicken Pizza', description: 'Grilled chicken, BBQ sauce, red onions', price: 12.00, category: 'Specialty' },
    { name: 'Garlic Bread', description: 'Toasted with garlic butter and herbs', price: 3.00, category: 'Sides' },
  ],
  [
    { name: 'Somali Coffee (Qaxwo)', description: 'Traditional spiced coffee with ginger', price: 2.00, category: 'Hot Drinks' },
    { name: 'Cappuccino', description: 'Espresso with steamed milk foam', price: 3.00, category: 'Hot Drinks' },
    { name: 'Croissant', description: 'Buttery French pastry', price: 2.50, category: 'Pastry' },
    { name: 'Banana Bread', description: 'Homemade with walnuts', price: 2.50, category: 'Pastry' },
  ],
  [
    { name: 'Mango Tango', description: 'Fresh mango, pineapple, and orange', price: 3.50, category: 'Smoothies' },
    { name: 'Watermelon Cooler', description: 'Chilled watermelon with mint', price: 2.50, category: 'Fresh Juice' },
    { name: 'Tropical Paradise', description: 'Papaya, banana, and coconut milk', price: 4.00, category: 'Smoothies' },
    { name: 'Lemon Mint Refresher', description: 'Fresh lemon with crushed mint', price: 2.00, category: 'Fresh Juice' },
  ],
];

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('🌱 Seeding test stores and menu items...');

  // Clean existing test data (optional — remove if you want to keep old test data)
  // await prisma.orderItem.deleteMany({});
  // await prisma.order.deleteMany({});
  // await prisma.menuItem.deleteMany({});
  // await prisma.store.deleteMany({});

  let imageIdx = 0;
  let foodIdx = 0;

  for (let i = 0; i < STORES.length; i++) {
    const storeData = STORES[i];
    const storeImage = STORE_IMAGES[imageIdx % STORE_IMAGES.length];
    imageIdx++;

    const store = await prisma.store.create({
      data: {
        name: storeData.name,
        description: storeData.description,
        phone: storeData.phone,
        address: storeData.address,
        category: storeData.category,
        imageUrl: storeImage,
        coverImageUrl: storeImage,
        deliveryFee: storeData.deliveryFee,
        minOrder: 5.00,
        openingTime: '07:00',
        closingTime: '22:00',
        isOpen: true,
        isActive: true,
        rating: 4.5 + Math.random() * 0.5,
      },
    });

    console.log(`  ✅ Created store: ${store.name} (${store.id})`);

    const items = MENU_ITEMS[i];
    for (const item of items) {
      const foodImage = FOOD_IMAGES[foodIdx % FOOD_IMAGES.length];
      foodIdx++;

      await prisma.menuItem.create({
        data: {
          storeId: store.id,
          name: item.name,
          description: item.description,
          price: item.price,
          imageUrl: foodImage,
          isAvailable: true,
          sortOrder: foodIdx,
        },
      });
      console.log(`     🍽️  Menu item: ${item.name}`);
    }
  }

  console.log('\n🎉 Seed complete! Open your app to see the stores and food images.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
