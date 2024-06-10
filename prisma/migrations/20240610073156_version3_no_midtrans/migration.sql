/*
  Warnings:

  - You are about to drop the column `order_id` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `url_redirect` on the `payments` table. All the data in the column will be lost.
  - Added the required column `payment_method` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PAYMENT_METHOD" AS ENUM ('DEBIT', 'CASH', 'TRANSFER');

-- DropIndex
DROP INDEX "payments_order_id_key";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "order_id",
DROP COLUMN "status",
DROP COLUMN "url_redirect",
ADD COLUMN     "payment_method" "PAYMENT_METHOD" NOT NULL;
