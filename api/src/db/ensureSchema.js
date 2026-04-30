// ============================================================
// ensureSchema.js — v3.0.0 Auto-create tables + add missing columns
// ============================================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['error'] });

async function ensureSchema() {
  console.log('[ensureSchema] Running v3.0.0 schema checks...');

  // Core tables that must exist
  const tables = [
    `CREATE TABLE IF NOT EXISTS "User" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      phone TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      password TEXT NOT NULL,
      "firstName" TEXT NOT NULL,
      "lastName" TEXT NOT NULL,
      avatar TEXT,
      role TEXT NOT NULL DEFAULT 'RIDER',
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "isVerified" BOOLEAN NOT NULL DEFAULT false,
      "fcmToken" TEXT,
      "lastLoginAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "RiderProfile" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId" TEXT UNIQUE NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      "homeAddress" TEXT,
      "homeCoordinates" JSONB,
      "workAddress" TEXT,
      "workCoordinates" JSONB,
      "preferredPayment" TEXT NOT NULL DEFAULT 'EVC_PLUS',
      "totalRides" INTEGER NOT NULL DEFAULT 0,
      "totalSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
      rating DOUBLE PRECISION NOT NULL DEFAULT 5.0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "DriverProfile" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId" TEXT UNIQUE NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      "licenseNumber" TEXT,
      "vehicleType" TEXT,
      "vehiclePlate" TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      "isOnline" BOOLEAN NOT NULL DEFAULT false,
      "currentLocation" JSONB,
      "canDeliver" BOOLEAN NOT NULL DEFAULT true,
      rating DOUBLE PRECISION NOT NULL DEFAULT 5.0,
      "totalRides" INTEGER NOT NULL DEFAULT 0,
      "totalEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "Wallet" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId" TEXT UNIQUE NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      balance DOUBLE PRECISION NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "Ride" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      "riderId" TEXT NOT NULL REFERENCES "User"(id),
      "driverId" TEXT REFERENCES "User"(id),
      status TEXT NOT NULL DEFAULT 'REQUESTED',
      "pickupAddress" TEXT NOT NULL,
      "pickupCoordinates" JSONB NOT NULL,
      "dropoffAddress" TEXT NOT NULL,
      "dropoffCoordinates" JSONB NOT NULL,
      "estimatedDistance" DOUBLE PRECISION,
      "estimatedDuration" INTEGER,
      "baseFare" DOUBLE PRECISION NOT NULL,
      "distanceFare" DOUBLE PRECISION NOT NULL,
      "timeFare" DOUBLE PRECISION NOT NULL,
      "surgeFare" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "totalFare" DOUBLE PRECISION NOT NULL,
      "finalFare" DOUBLE PRECISION,
      "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "commissionAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "driverEarnings" DOUBLE PRECISION,
      rating INTEGER,
      "ratingComment" TEXT,
      "startedAt" TIMESTAMP(3),
      "completedAt" TIMESTAMP(3),
      "cancelledAt" TIMESTAMP(3),
      "cancelReason" TEXT,
      "cancelledBy" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "Store" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      "ownerId" TEXT,
      name TEXT NOT NULL,
      description TEXT,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      coordinates JSONB,
      category TEXT NOT NULL,
      "imageUrl" TEXT,
      "deliveryFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "minOrder" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "isOpen" BOOLEAN NOT NULL DEFAULT true,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      rating DOUBLE PRECISION NOT NULL DEFAULT 5.0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "MenuItem" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      "storeId" TEXT NOT NULL REFERENCES "Store"(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      price DOUBLE PRECISION NOT NULL,
      "imageUrl" TEXT,
      "isAvailable" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "StoreOwnerProfile" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId" TEXT UNIQUE NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      "storeId" TEXT REFERENCES "Store"(id),
      "totalOrders" INTEGER NOT NULL DEFAULT 0,
      "totalEarnings" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "ProviderProfile" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId" TEXT UNIQUE NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      "businessName" TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      phone TEXT NOT NULL,
      address TEXT,
      coordinates JSONB,
      "isApproved" BOOLEAN NOT NULL DEFAULT false,
      "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 5,
      "isAvailable" BOOLEAN NOT NULL DEFAULT true,
      "totalCars" INTEGER NOT NULL DEFAULT 0,
      "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
      rating DOUBLE PRECISION NOT NULL DEFAULT 5.0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "Car" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      "providerId" TEXT NOT NULL REFERENCES "ProviderProfile"(id),
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      color TEXT NOT NULL,
      "plateNumber" TEXT UNIQUE NOT NULL,
      "vehicleType" TEXT NOT NULL,
      "imageUrl" TEXT,
      "pricePerHour" DOUBLE PRECISION NOT NULL,
      "pricePerDay" DOUBLE PRECISION NOT NULL,
      "isAvailable" BOOLEAN NOT NULL DEFAULT true,
      "isVerified" BOOLEAN NOT NULL DEFAULT false,
      location JSONB,
      address TEXT,
      rating DOUBLE PRECISION NOT NULL DEFAULT 5.0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "Order" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      "orderNumber" TEXT UNIQUE NOT NULL,
      "storeId" TEXT NOT NULL REFERENCES "Store"(id),
      "riderId" TEXT NOT NULL REFERENCES "User"(id),
      "driverId" TEXT REFERENCES "User"(id),
      status TEXT NOT NULL DEFAULT 'PENDING',
      subtotal DOUBLE PRECISION NOT NULL,
      "deliveryFee" DOUBLE PRECISION NOT NULL,
      "serviceFee" DOUBLE PRECISION NOT NULL,
      "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "totalAmount" DOUBLE PRECISION NOT NULL,
      "commissionAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "deliveryAddress" TEXT NOT NULL,
      "deliveryCoordinates" JSONB NOT NULL,
      "paymentMethod" TEXT NOT NULL DEFAULT 'EVC_PLUS',
      "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "OrderItem" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      "orderId" TEXT NOT NULL REFERENCES "Order"(id) ON DELETE CASCADE,
      "menuItemId" TEXT NOT NULL REFERENCES "MenuItem"(id),
      quantity INTEGER NOT NULL,
      "unitPrice" DOUBLE PRECISION NOT NULL,
      "totalPrice" DOUBLE PRECISION NOT NULL,
      notes TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "CarRentalBooking" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      "bookingNumber" TEXT UNIQUE NOT NULL,
      "carId" TEXT NOT NULL REFERENCES "Car"(id),
      "riderId" TEXT NOT NULL REFERENCES "User"(id),
      status TEXT NOT NULL DEFAULT 'PENDING',
      "startDate" TIMESTAMP(3) NOT NULL,
      "endDate" TIMESTAMP(3) NOT NULL,
      "durationHours" DOUBLE PRECISION NOT NULL,
      subtotal DOUBLE PRECISION NOT NULL,
      "depositAmount" DOUBLE PRECISION NOT NULL,
      "serviceFee" DOUBLE PRECISION NOT NULL,
      "totalAmount" DOUBLE PRECISION NOT NULL,
      "commissionAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "paymentMethod" TEXT NOT NULL DEFAULT 'EVC_PLUS',
      "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "Transaction" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      "walletId" TEXT NOT NULL REFERENCES "Wallet"(id),
      "userId" TEXT NOT NULL REFERENCES "User"(id),
      type TEXT NOT NULL,
      amount DOUBLE PRECISION NOT NULL,
      "balanceAfter" DOUBLE PRECISION,
      description TEXT,
      "referenceId" TEXT,
      "referenceType" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "Notification" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId" TEXT NOT NULL REFERENCES "User"(id),
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      data JSONB,
      "isRead" BOOLEAN NOT NULL DEFAULT false,
      "readAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "Chat" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      "rideId" TEXT REFERENCES "Ride"(id),
      "orderId" TEXT REFERENCES "Order"(id),
      "senderId" TEXT NOT NULL REFERENCES "User"(id),
      "receiverId" TEXT NOT NULL REFERENCES "User"(id),
      message TEXT NOT NULL,
      "isRead" BOOLEAN NOT NULL DEFAULT false,
      "readAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "SOSAlert" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId" TEXT NOT NULL REFERENCES "User"(id),
      "rideId" TEXT REFERENCES "Ride"(id),
      "orderId" TEXT REFERENCES "Order"(id),
      location JSONB,
      address TEXT,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      "resolvedAt" TIMESTAMP(3),
      "resolvedBy" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "AdminProfile" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId" TEXT UNIQUE NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      "adminRole" TEXT NOT NULL DEFAULT 'CARE',
      permissions JSONB,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "FareSetting" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      "vehicleType" TEXT UNIQUE NOT NULL,
      "baseFare" DOUBLE PRECISION NOT NULL,
      "perKmRate" DOUBLE PRECISION NOT NULL,
      "perMinuteRate" DOUBLE PRECISION NOT NULL,
      "minimumFare" DOUBLE PRECISION NOT NULL,
      "surgeMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "Escrow" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      "bookingId" TEXT UNIQUE NOT NULL REFERENCES "CarRentalBooking"(id),
      amount DOUBLE PRECISION NOT NULL,
      status TEXT NOT NULL DEFAULT 'HELD',
      "providerId" TEXT NOT NULL REFERENCES "ProviderProfile"(id),
      "heldAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      "releaseAt" TIMESTAMP(3),
      "releasedAt" TIMESTAMP(3),
      "refundedAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "PromoCode" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      code TEXT UNIQUE NOT NULL,
      "discountType" TEXT NOT NULL,
      "discountValue" DOUBLE PRECISION NOT NULL,
      "startDate" TIMESTAMP(3) NOT NULL,
      "endDate" TIMESTAMP(3) NOT NULL,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "maxUses" INTEGER,
      "usedCount" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "Promotion" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      "imageUrl" TEXT,
      type TEXT NOT NULL,
      "targetRole" TEXT,
      "targetScreen" TEXT,
      "actionUrl" TEXT,
      "startDate" TIMESTAMP(3) NOT NULL,
      "endDate" TIMESTAMP(3) NOT NULL,
      "displayOrder" INTEGER NOT NULL DEFAULT 0,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "Lottery" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      "ticketPrice" DOUBLE PRECISION NOT NULL,
      "maxTickets" INTEGER NOT NULL,
      "soldTickets" INTEGER NOT NULL DEFAULT 0,
      "prizePool" DOUBLE PRECISION NOT NULL,
      "prizeDescription" TEXT,
      "prizeImageUrl" TEXT,
      "startDate" TIMESTAMP(3) NOT NULL,
      "endDate" TIMESTAMP(3) NOT NULL,
      "drawDate" TIMESTAMP(3) NOT NULL,
      status TEXT NOT NULL DEFAULT 'UPCOMING',
      "winnerId" TEXT REFERENCES "User"(id),
      "winningTicket" TEXT,
      "termsAndConditions" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "LotteryTicket" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      "lotteryId" TEXT NOT NULL REFERENCES "Lottery"(id) ON DELETE CASCADE,
      "userId" TEXT NOT NULL REFERENCES "User"(id),
      "ticketNumber" TEXT NOT NULL,
      "totalPrice" DOUBLE PRECISION NOT NULL,
      "isWinner" BOOLEAN NOT NULL DEFAULT false,
      "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "SavedAddress" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId" TEXT NOT NULL REFERENCES "User"(id),
      label TEXT NOT NULL,
      address TEXT NOT NULL,
      coordinates JSONB NOT NULL,
      "isDefault" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "SupportContact" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      type TEXT NOT NULL,
      label TEXT NOT NULL,
      value TEXT NOT NULL,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "LegalDocument" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      type TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL,
      version TEXT NOT NULL,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "AdminSetting" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      key TEXT UNIQUE NOT NULL,
      value JSONB NOT NULL,
      description TEXT,
      "updatedBy" TEXT,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "FeatureToggle" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      key TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      "isActive" BOOLEAN NOT NULL DEFAULT false,
      "targetRole" TEXT,
      percentage INTEGER NOT NULL DEFAULT 100,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "SurgeZone" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      coordinates JSONB NOT NULL,
      multiplier DOUBLE PRECISION NOT NULL,
      "startDate" TIMESTAMP(3) NOT NULL,
      "endDate" TIMESTAMP(3) NOT NULL,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "Payout" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId" TEXT NOT NULL REFERENCES "User"(id),
      amount DOUBLE PRECISION NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      method TEXT NOT NULL,
      "bankName" TEXT,
      "accountNumber" TEXT,
      "accountName" TEXT,
      phone TEXT,
      "approvedBy" TEXT,
      "approvedAt" TIMESTAMP(3),
      "completedAt" TIMESTAMP(3),
      "rejectedAt" TIMESTAMP(3),
      "rejectReason" TEXT,
      notes TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS "AuditLog" (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId" TEXT REFERENCES "User"(id),
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      "entityId" TEXT,
      "oldValues" JSONB,
      "newValues" JSONB,
      ip TEXT,
      "userAgent" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )`,
  ];

  for (const sql of tables) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch (e) {
      // Table might already exist
    }
  }

  // Create indexes
  const indexes = [
    'CREATE INDEX IF NOT EXISTS "User_phone_idx" ON "User"(phone)',
    'CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"(role)',
    'CREATE INDEX IF NOT EXISTS "Ride_status_idx" ON "Ride"(status)',
    'CREATE INDEX IF NOT EXISTS "Ride_riderId_idx" ON "Ride"("riderId")',
    'CREATE INDEX IF NOT EXISTS "Ride_driverId_idx" ON "Ride"("driverId")',
    'CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"(status)',
    'CREATE INDEX IF NOT EXISTS "Order_riderId_idx" ON "Order"("riderId")',
    'CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId")',
    'CREATE INDEX IF NOT EXISTS "DriverProfile_status_idx" ON "DriverProfile"(status)',
    'CREATE INDEX IF NOT EXISTS "Car_isAvailable_idx" ON "Car"("isAvailable")',
  ];

  for (const sql of indexes) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch (e) {
      // Index might already exist
    }
  }

  // Add missing columns to existing tables
  const columns = [
    { table: 'User', column: 'gender', type: 'TEXT', nullable: true },
    { table: 'User', column: 'termsAccepted', type: 'BOOLEAN', nullable: false, default: false },
    { table: 'DriverProfile', column: 'documents', type: 'JSONB', nullable: true },
    { table: 'DriverProfile', column: 'approvedAt', type: 'TIMESTAMP(3)', nullable: true },
    { table: 'Store', column: 'openingTime', type: 'TEXT', nullable: true },
    { table: 'Store', column: 'closingTime', type: 'TEXT', nullable: true },
    { table: 'Store', column: 'preparationTime', type: 'INTEGER', nullable: true, default: 30 },
    { table: 'Store', column: 'coverImageUrl', type: 'TEXT', nullable: true },
    { table: 'Store', column: 'verificationPin', type: 'TEXT', nullable: true },
    { table: 'Order', column: 'pickupPin', type: 'TEXT', nullable: true },
    { table: 'Order', column: 'confirmedAt', type: 'TIMESTAMP(3)', nullable: true },
    { table: 'Order', column: 'preparingAt', type: 'TIMESTAMP(3)', nullable: true },
    { table: 'Order', column: 'readyAt', type: 'TIMESTAMP(3)', nullable: true },
    { table: 'Order', column: 'pickedUpAt', type: 'TIMESTAMP(3)', nullable: true },
    { table: 'Order', column: 'deliveredAt', type: 'TIMESTAMP(3)', nullable: true },
    { table: 'Order', column: 'cancelledAt', type: 'TIMESTAMP(3)', nullable: true },
    { table: 'Car', column: 'images', type: 'TEXT', nullable: true },
    { table: 'Car', column: 'features', type: 'TEXT', nullable: true },
    { table: 'Car', column: 'fuelType', type: 'TEXT', nullable: true },
    { table: 'Car', column: 'transmission', type: 'TEXT', nullable: true },
    { table: 'Car', column: 'seats', type: 'INTEGER', nullable: true },
    { table: 'Car', column: 'mileage', type: 'INTEGER', nullable: true },
    { table: 'Car', column: 'verifiedAt', type: 'TIMESTAMP(3)', nullable: true },
    { table: 'ProviderProfile', column: 'approvedAt', type: 'TIMESTAMP(3)', nullable: true },
  ];

  for (const col of columns) {
    const checkSql = `SELECT column_name FROM information_schema.columns WHERE table_name = '${col.table}' AND column_name = '${col.column}'`;
    try {
      const result = await prisma.$queryRawUnsafe(checkSql);
      if (result.length === 0) {
        let alterSql = `ALTER TABLE "${col.table}" ADD COLUMN "${col.column}" ${col.type}`;
        if (!col.nullable) {
          alterSql += col.default !== undefined ? ` NOT NULL DEFAULT ${typeof col.default === 'boolean' ? col.default : `'${col.default}'`}` : ' NOT NULL';
        }
        await prisma.$executeRawUnsafe(alterSql);
        console.log(`[ensureSchema] Added column ${col.table}.${col.column}`);
      }
    } catch (e) {
      // Column might already exist or other issue
    }
  }

  console.log('[ensureSchema] v3.0.0 schema check complete ✅');
}

module.exports = { ensureSchema };
