-- AlterTable
ALTER TABLE "Productos" ADD COLUMN     "qr_url" TEXT;

-- CreateTable
CREATE TABLE "ProductoUbicacion" (
    "id" SERIAL NOT NULL,
    "productoId" TEXT NOT NULL,
    "binId" INTEGER,
    "rackId" INTEGER,
    "cantidad" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "ProductoUbicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Floor" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,

    CONSTRAINT "Floor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rack" (
    "id" SERIAL NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "locked" BOOLEAN NOT NULL,
    "qrData" TEXT NOT NULL,
    "floorId" INTEGER NOT NULL,

    CONSTRAINT "Rack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bin" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "row" INTEGER NOT NULL,
    "column" INTEGER NOT NULL,
    "rackId" INTEGER NOT NULL,

    CONSTRAINT "Bin_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductoUbicacion" ADD CONSTRAINT "ProductoUbicacion_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Productos"("productoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductoUbicacion" ADD CONSTRAINT "ProductoUbicacion_binId_fkey" FOREIGN KEY ("binId") REFERENCES "Bin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductoUbicacion" ADD CONSTRAINT "ProductoUbicacion_rackId_fkey" FOREIGN KEY ("rackId") REFERENCES "Rack"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rack" ADD CONSTRAINT "Rack_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "Floor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bin" ADD CONSTRAINT "Bin_rackId_fkey" FOREIGN KEY ("rackId") REFERENCES "Rack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
