-- AlterTable: Add payout fields to driver_profiles
ALTER TABLE "driver_profiles" ADD COLUMN "bankName" TEXT;
ALTER TABLE "driver_profiles" ADD COLUMN "bankAccountNumber" TEXT;
ALTER TABLE "driver_profiles" ADD COLUMN "bankAccountName" TEXT;
ALTER TABLE "driver_profiles" ADD COLUMN "payoutMethod" TEXT DEFAULT 'WALLET';
ALTER TABLE "driver_profiles" ADD COLUMN "payoutPhone" TEXT;
