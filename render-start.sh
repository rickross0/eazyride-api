#!/bin/bash
set -e

echo "[render-start] Starting EazyRide + Haye! Backend..."

# Sync Prisma schema to DB (handles schema changes without migration files)
echo "[render-start] Running Prisma db push..."
npx prisma db push --accept-data-loss 2>/dev/null || echo "[render-start] ⚠️  Prisma db push had issues, continuing..."

# Run ensureSchema (creates missing tables/columns, idempotent)
echo "[render-start] Running ensureSchema..."
node src/db/ensureSchema.js || echo "[render-start] ⚠️  ensureSchema had issues, continuing..."

# Start the server
echo "[render-start] Starting server..."
node src/server.js
