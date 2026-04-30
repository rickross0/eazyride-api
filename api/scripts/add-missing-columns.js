#!/usr/bin/env node
/**
 * Emergency script: Add missing columns directly to the database.
 * Run with: node scripts/add-missing-columns.js
 * 
 * This is a safety net if Prisma migrations fail on Render.
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Adding missing columns...');
  
  const columns = [
    { table: 'users', column: 'gender', type: 'TEXT', nullable: true },
    { table: 'users', column: 'termsAccepted', type: 'BOOLEAN', nullable: false, default: false },
  ];

  for (const col of columns) {
    try {
      const defaultVal = col.default === false ? 'false' : col.default === true ? 'true' : null;
      const sql = col.nullable
        ? `ALTER TABLE "${col.table}" ADD COLUMN IF NOT EXISTS "${col.column}" ${col.type}`
        : `ALTER TABLE "${col.table}" ADD COLUMN IF NOT EXISTS "${col.column}" ${col.type} NOT NULL DEFAULT ${defaultVal}`;
      
      await prisma.$executeRawUnsafe(sql);
      console.log(`✅ Added column ${col.table}.${col.column}`);
    } catch (e) {
      if (e.message && e.message.includes('already exists')) {
        console.log(`ℹ️  Column ${col.table}.${col.column} already exists`);
      } else {
        console.error(`❌ Failed to add ${col.table}.${col.column}:`, e.message);
      }
    }
  }

  await prisma.$disconnect();
  console.log('✅ Done');
}

main().catch(console.error);
