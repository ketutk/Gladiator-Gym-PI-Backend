/*
  Warnings:

  - You are about to drop the column `user_id` on the `payments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[staff_id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `staff_id` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_user_id_fkey";

-- DropIndex
DROP INDEX "payments_user_id_key";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "user_id",
ADD COLUMN     "staff_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "payments_staff_id_key" ON "payments"("staff_id");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
