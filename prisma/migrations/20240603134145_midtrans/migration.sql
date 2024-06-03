/*
  Warnings:

  - Added the required column `status` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url_redirect` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "url_redirect" TEXT NOT NULL;
