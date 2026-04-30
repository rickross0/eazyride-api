-- Make dropoff coordinates nullable on the actual "rides" table
-- (original migration 20260422 used wrong table name "Ride" and failed)
ALTER TABLE "rides" ALTER COLUMN "dropoffLat" DROP NOT NULL;
ALTER TABLE "rides" ALTER COLUMN "dropoffLng" DROP NOT NULL;
