-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_member_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_package_id_fkey";

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "member_id" DROP NOT NULL,
ALTER COLUMN "package_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE SET NULL;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE SET NULL ON UPDATE SET NULL;
