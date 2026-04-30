-- CreateEnum
CREATE TYPE "AdminLevel" AS ENUM ('SUPER', 'MANAGER', 'CARE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "adminLevel" "AdminLevel";
