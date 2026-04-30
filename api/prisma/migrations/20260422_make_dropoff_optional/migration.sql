-- Make dropoff coordinates optional for ride-without-dropoff feature
ALTER TABLE "rides" ALTER COLUMN "dropoffLat" DROP NOT NULL;
ALTER TABLE "rides" ALTER COLUMN "dropoffLng" DROP NOT NULL;
