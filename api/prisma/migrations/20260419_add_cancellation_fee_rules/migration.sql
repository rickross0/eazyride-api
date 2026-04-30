-- AlterTable: Add cancellationFeeRules relation to service_providers
-- (no column change needed, just a relation)

-- CreateTable: CancellationFeeRule
CREATE TABLE "cancellation_fee_rules" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "hoursBefore" INTEGER NOT NULL,
    "feePercent" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cancellation_fee_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cancellation_fee_rules_providerId_hoursBefore_key" ON "cancellation_fee_rules"("providerId", "hoursBefore");

-- AddForeignKey: cancellation_fee_rules.providerId -> service_providers.id
ALTER TABLE "cancellation_fee_rules" ADD CONSTRAINT "cancellation_fee_rules_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "service_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
