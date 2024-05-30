-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_staff_id_fkey";

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "staff_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE SET NULL;
