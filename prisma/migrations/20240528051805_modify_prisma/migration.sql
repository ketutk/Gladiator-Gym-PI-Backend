-- AlterTable
ALTER TABLE "memberships" ALTER COLUMN "status" SET DEFAULT false,
ALTER COLUMN "active_until" DROP NOT NULL;
