-- AlterTable: Add commissionRate to service_providers
ALTER TABLE "service_providers" ADD COLUMN "commissionRate" FLOAT NOT NULL DEFAULT 15.0;
