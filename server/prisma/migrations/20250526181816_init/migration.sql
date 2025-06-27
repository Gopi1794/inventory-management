/*
  Warnings:

  - Added the required column `fechaDeCreacion` to the `Productos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fechaDeModificacion` to the `Productos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Productos" ADD COLUMN     "fechaDeCreacion" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "fechaDeEliminacion" TIMESTAMP(3),
ADD COLUMN     "fechaDeModificacion" TIMESTAMP(3) NOT NULL;
