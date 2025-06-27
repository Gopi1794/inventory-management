/*
  Warnings:

  - You are about to drop the column `binId` on the `ProductoUbicacion` table. All the data in the column will be lost.
  - You are about to drop the column `rackId` on the `ProductoUbicacion` table. All the data in the column will be lost.
  - You are about to drop the column `floorId` on the `Rack` table. All the data in the column will be lost.
  - You are about to drop the `Bin` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `rackId` to the `Floor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `floorId` to the `ProductoUbicacion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Bin" DROP CONSTRAINT "Bin_rackId_fkey";

-- DropForeignKey
ALTER TABLE "ProductoUbicacion" DROP CONSTRAINT "ProductoUbicacion_binId_fkey";

-- DropForeignKey
ALTER TABLE "ProductoUbicacion" DROP CONSTRAINT "ProductoUbicacion_rackId_fkey";

-- DropForeignKey
ALTER TABLE "Rack" DROP CONSTRAINT "Rack_floorId_fkey";

-- AlterTable
ALTER TABLE "Floor" ADD COLUMN     "rackId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ProductoUbicacion" DROP COLUMN "binId",
DROP COLUMN "rackId",
ADD COLUMN     "floorId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Rack" DROP COLUMN "floorId";

-- DropTable
DROP TABLE "Bin";

-- AddForeignKey
ALTER TABLE "ProductoUbicacion" ADD CONSTRAINT "ProductoUbicacion_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "Floor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Floor" ADD CONSTRAINT "Floor_rackId_fkey" FOREIGN KEY ("rackId") REFERENCES "Rack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
