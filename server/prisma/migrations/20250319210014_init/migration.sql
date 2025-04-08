/*
  Warnings:

  - You are about to drop the column `resumenDeGatosId` on the `GastosPorCategoria` table. All the data in the column will be lost.
  - The primary key for the `ResumenDeGastos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `resumenDeGatosId` on the `ResumenDeGastos` table. All the data in the column will be lost.
  - You are about to drop the `Usuario` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `resumenDeGastosId` to the `GastosPorCategoria` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resumenDeGastosId` to the `ResumenDeGastos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "GastosPorCategoria" DROP CONSTRAINT "GastosPorCategoria_resumenDeGatosId_fkey";

-- AlterTable
ALTER TABLE "GastosPorCategoria" DROP COLUMN "resumenDeGatosId",
ADD COLUMN     "resumenDeGastosId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ResumenDeGastos" DROP CONSTRAINT "ResumenDeGastos_pkey",
DROP COLUMN "resumenDeGatosId",
ADD COLUMN     "resumenDeGastosId" TEXT NOT NULL,
ADD CONSTRAINT "ResumenDeGastos_pkey" PRIMARY KEY ("resumenDeGastosId");

-- DropTable
DROP TABLE "Usuario";

-- CreateTable
CREATE TABLE "Usuarios" (
    "usuarioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Usuarios_pkey" PRIMARY KEY ("usuarioId")
);

-- AddForeignKey
ALTER TABLE "GastosPorCategoria" ADD CONSTRAINT "GastosPorCategoria_resumenDeGastosId_fkey" FOREIGN KEY ("resumenDeGastosId") REFERENCES "ResumenDeGastos"("resumenDeGastosId") ON DELETE RESTRICT ON UPDATE CASCADE;
