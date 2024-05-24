/*
  Warnings:

  - You are about to drop the column `is_verified` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "is_verified";

-- DropEnum
DROP TYPE "CLASS";

-- DropEnum
DROP TYPE "FLIGHT_TYPE";
