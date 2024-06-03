/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ktp_id]` on the table `profiles` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "profiles_phone_key" ON "profiles"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_ktp_id_key" ON "profiles"("ktp_id");
