/*
  Warnings:

  - The primary key for the `ResumenDeCompras` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `rsumenDeComprasId` on the `ResumenDeCompras` table. All the data in the column will be lost.
  - Added the required column `resumenDeComprasId` to the `ResumenDeCompras` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ResumenDeCompras" DROP CONSTRAINT "ResumenDeCompras_pkey",
DROP COLUMN "rsumenDeComprasId",
ADD COLUMN     "resumenDeComprasId" TEXT NOT NULL,
ADD CONSTRAINT "ResumenDeCompras_pkey" PRIMARY KEY ("resumenDeComprasId");
