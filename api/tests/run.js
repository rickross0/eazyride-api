#!/usr/bin/env node
/**
 * EazyRide+Haye! Integration Test Runner
 * 
 * Prerequisites:
 *   1. PostgreSQL running:   sudo service postgresql start
 *   2. Redis running:        sudo service redis-server start
 *   3. DB migrated:          cd backend && npx prisma migrate dev
 *   4. Seed data loaded:     npm run db:seed
 *   5. Install supertest:    npm install --save-dev supertest
 *   6. Server NOT running (tests start it internally)
 *
 * Usage:
 *   node tests/run.js              # Run all tests
 *   node tests/run.js rider        # Run only rider tests
 *   node tests/run.js driver       # Run only driver tests
 *   node tests/run.js provider     # Run only provider tests
 *   node tests/run.js store-owner  # Run only store-owner tests
 */

const { spawn } = require('child_process');
const path = require('path');

const ALL_SUITES = ['rider/auth', 'rider/rides', 'rider/wallet', 'rider/food', 'rider/carRental', 'driver/driver', 'driver/rides', 'provider/provider', 'store-owner/store-owner'];

const arg = process.argv[2] || 'all';
let suites;

if (arg === 'all') {
  suites = ALL_SUITES;
} else if (arg === 'rider' || arg === 'driver' || arg === 'provider' || arg === 'store-owner') {
  suites = ALL_SUITES.filter(s => s.startsWith(arg + '/'));
} else {
  suites = [arg];
}

console.log('\n🧪 EazyRide+Haye! Integration Tests\n');
console.log(`Running ${suites.length} test suite(s): ${suites.join(', ')}\n`);

// Run suites sequentially
async function runSuite(suite) {
  return new Promise((resolve) => {
    const testFile = path.join(__dirname, `${suite}.test.js`);
    const child = spawn('node', ['--test', testFile], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'test' },
    });
    child.on('close', (code) => {
      resolve({ suite, code });
    });
  });
}

async function run() {
  let passed = 0;
  let failed = 0;
  for (const suite of suites) {
    console.log(`\n▶ Running: ${suite}`);
    const result = await runSuite(suite);
    if (result.code === 0) {
      passed++;
      console.log(`✅ ${suite} — PASSED\n`);
    } else {
      failed++;
      console.log(`❌ ${suite} — FAILED (exit code ${result.code})\n`);
    }
  }
  console.log('\n' + '═'.repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed, ${suites.length} total`);
  console.log('═'.repeat(50) + '\n');
  process.exit(failed > 0 ? 1 : 0);
}

run();
