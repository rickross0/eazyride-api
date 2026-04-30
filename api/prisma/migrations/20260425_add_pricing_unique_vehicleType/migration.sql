-- CreateIndex: Add unique constraint on vehicleType for pricing_settings
CREATE UNIQUE INDEX IF NOT EXISTS "pricing_settings_vehicleType_key" ON "pricing_settings"("vehicleType");
