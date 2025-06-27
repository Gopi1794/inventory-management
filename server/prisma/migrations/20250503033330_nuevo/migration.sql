/*
  Warnings:

  - You are about to alter the column `total` on the `GastosPorCategoria` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `BigInt`.

*/
-- AlterTable
ALTER TABLE "GastosPorCategoria" ALTER COLUMN "total" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "Productos" ADD COLUMN     "descripcion" TEXT DEFAULT 'Descripción no disponible',
ADD COLUMN     "proveedor" TEXT DEFAULT 'Proveedor no especificado';

-- CreateTable
CREATE TABLE "Roles" (
    "id" SERIAL NOT NULL,
    "nombre_usuario" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "rol" TEXT NOT NULL,

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Roles_nombre_usuario_key" ON "Roles"("nombre_usuario");
