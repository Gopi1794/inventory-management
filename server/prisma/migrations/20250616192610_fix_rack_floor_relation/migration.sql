/*
  Warnings:

  - A unique constraint covering the columns `[rackId,level]` on the table `Floor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[qrData]` on the table `Rack` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Floor" DROP CONSTRAINT "Floor_rackId_fkey";

-- AlterTable
ALTER TABLE "Rack" ALTER COLUMN "locked" SET DEFAULT false;

-- CreateIndex
CREATE INDEX "Floor_rackId_idx" ON "Floor"("rackId");

-- CreateIndex
CREATE UNIQUE INDEX "Floor_rackId_level_key" ON "Floor"("rackId", "level");

-- CreateIndex
CREATE UNIQUE INDEX "Rack_qrData_key" ON "Rack"("qrData");

-- CreateIndex
CREATE INDEX "Rack_qrData_idx" ON "Rack"("qrData");

-- AddForeignKey
ALTER TABLE "Floor" ADD CONSTRAINT "Floor_rackId_fkey" FOREIGN KEY ("rackId") REFERENCES "Rack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
