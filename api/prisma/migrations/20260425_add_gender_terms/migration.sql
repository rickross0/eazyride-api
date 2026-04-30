-- Add gender and termsAccepted columns to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "gender" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "termsAccepted" BOOLEAN NOT NULL DEFAULT false;
