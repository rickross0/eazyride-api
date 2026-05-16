#!/usr/bin/env node
/**
 * Deploy migrations — designed to be run at server startup (render-start).
 * Handles stuck migrations, then applies pending ones, with a prisma db push fallback.
 */
const { execSync } = require('child_process');

console.log('=== Starting database migrations ===');

// Step 1: Resolve any previously failed/stuck migrations
const stuckMigrations = [
  '20260422_make_dropoff_optional',
  '20260425_add_gender_terms',
  '20260425_add_pricing_unique_vehicleType',
  '20260425_add_rental_company_role',
  '20260425_fix_dropoff_nullable',
];

for (const migration of stuckMigrations) {
  console.log(`Resolving stuck migration: ${migration}`);
  try {
    execSync(`npx prisma migrate resolve --rolled-back "${migration}"`, {
      stdio: 'pipe',
      timeout: 30000,
    });
    console.log(`✅ Resolved: ${migration}`);
  } catch (e) {
    const msg = e.stderr?.toString() || e.message;
    if (msg.includes('already been applied') || msg.includes('does not exist') || msg.includes('marked as rolled back')) {
      console.log(`ℹ️  ${migration}: already resolved`);
    } else {
      console.log(`⚠️  Could not resolve ${migration}: ${msg.split('\n')[0]}`);
    }
  }
}

// Step 2: Apply all pending migrations
console.log('Applying pending migrations...');
let migrateSuccess = false;
try {
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    timeout: 120000,
  });
  migrateSuccess = true;
  console.log('✅ Migrations applied successfully');
} catch (e) {
  console.error('❌ Migration deploy failed:', e.message);
}

// Step 3: Fallback — use prisma db push if migrations failed
// This ensures schema changes (like gender column) get applied even if
// the migration history is corrupted
if (!migrateSuccess) {
  console.log('⚠️  Trying prisma db push as fallback...');
  try {
    execSync('npx prisma db push --accept-data-loss', {
      stdio: 'inherit',
      timeout: 120000,
    });
    console.log('✅ Schema pushed successfully via db push');
  } catch (e) {
    console.error('❌ db push also failed:', e.message);
    console.error('Server will start anyway — some features may not work if the schema is out of date.');
  }
}
