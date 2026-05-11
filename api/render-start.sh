#!/bin/bash
set -e

echo "[render-start] Starting EazyRide + Haye! Backend..."

# Run Prisma migrations (safe, idempotent)
echo "[render-start] Running Prisma migrate deploy..."
npx prisma migrate deploy || echo "[render-start] ⚠️  Migrations had issues, continuing..."

# Run ensureSchema (creates missing tables/columns, idempotent)
echo "[render-start] Running ensureSchema..."
node src/db/ensureSchema.js || echo "[render-start] ⚠️  ensureSchema had issues, continuing..."

# Start the server
echo "[render-start] Starting server..."
node src/server.js
