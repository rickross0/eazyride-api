#!/bin/bash
# ──────────────────────────────────────────────────────
# EazyRide+Haye! Test Setup Script
# ──────────────────────────────────────────────────────
set -e

echo "🧪 EazyRide+Haye! — Test Setup"
echo "================================"
echo ""

# 1. Check PostgreSQL
echo "📦 Checking PostgreSQL..."
if pg_isready -q 2>/dev/null; then
  echo "   ✅ PostgreSQL is running"
else
  echo "   ⚠️  PostgreSQL not running. Start it with:"
  echo "      sudo service postgresql start"
  echo "      # or"
  echo "      sudo pg_ctlcluster 18 main start"
  exit 1
fi

# 2. Check Redis
echo "📦 Checking Redis..."
if redis-cli ping > /dev/null 2>&1; then
  echo "   ✅ Redis is running"
else
  echo "   ⚠️  Redis not running. Start it with:"
  echo "      sudo service redis-server start"
  exit 1
fi

# 3. Check database exists and migrate
echo "📦 Checking database migrations..."
if npx prisma migrate status 2>/dev/null | grep -q "up to date"; then
  echo "   ✅ Database migrations up to date"
else
  echo "   🔄 Running database migrations..."
  npx prisma migrate dev --name init
fi

# 4. Seed data
echo "📦 Checking seed data..."
npm run db:seed 2>/dev/null || node prisma/seed.js
echo "   ✅ Seed data loaded"

# 5. Install test dependencies
echo "📦 Installing test dependencies..."
npm install --save-dev supertest 2>/dev/null || {
  echo "   ⚠️  Could not install supertest from npm. Trying manual install..."
  echo "   Make sure you have network access and run:"
  echo "      cd backend && npm install --save-dev supertest"
  echo ""
  echo "   Alternatively, if you already have supertest installed globally:"
  echo "      npm link supertest"
  exit 1
}
echo "   ✅ supertest installed"

echo ""
echo "✅ Setup complete! Run tests with:"
echo "   npm test              # All tests"
echo "   npm run test:rider    # Rider tests"
echo "   npm run test:driver   # Driver tests"
echo "   npm run test:provider # Provider tests"
echo "   npm run test:store-owner # Store-Owner tests"
echo ""
echo "   Or directly: node tests/run.js [rider|driver|provider|store-owner]"
