/*
  Warnings:

  - Added the required column `userId` to the `payout_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payout_requests" ADD COLUMN     "periodEnd" TIMESTAMP(3),
ADD COLUMN     "periodStart" TIMESTAMP(3),
ADD COLUMN     "userId" TEXT NOT NULL;
