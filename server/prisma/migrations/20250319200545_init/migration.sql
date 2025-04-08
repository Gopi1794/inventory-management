-- CreateTable
CREATE TABLE "Usuario" (
    "usuarioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("usuarioId")
);

-- CreateTable
CREATE TABLE "Productos" (
    "productoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "categoria" DOUBLE PRECISION,
    "cantidadExistente" INTEGER NOT NULL,

    CONSTRAINT "Productos_pkey" PRIMARY KEY ("productoId")
);

-- CreateTable
CREATE TABLE "Ventas" (
    "ventasId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "fechaYhora" TIMESTAMP(3) NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnidad" DOUBLE PRECISION NOT NULL,
    "cantidadTotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Ventas_pkey" PRIMARY KEY ("ventasId")
);

-- CreateTable
CREATE TABLE "Compras" (
    "comprasId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "fechaYhora" TIMESTAMP(3) NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnidad" DOUBLE PRECISION NOT NULL,
    "precioTotal" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Compras_pkey" PRIMARY KEY ("comprasId")
);

-- CreateTable
CREATE TABLE "Gastos" (
    "gastosId" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "fechaYhora" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gastos_pkey" PRIMARY KEY ("gastosId")
);

-- CreateTable
CREATE TABLE "ResumenDeVentas" (
    "resumenDeVentasId" TEXT NOT NULL,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "porcentajeDeCambio" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumenDeVentas_pkey" PRIMARY KEY ("resumenDeVentasId")
);

-- CreateTable
CREATE TABLE "ResumenDeCompras" (
    "rsumenDeComprasId" TEXT NOT NULL,
    "totalComprado" DOUBLE PRECISION NOT NULL,
    "porcentajeDeCambio" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumenDeCompras_pkey" PRIMARY KEY ("rsumenDeComprasId")
);

-- CreateTable
CREATE TABLE "ResumenDeGastos" (
    "resumenDeGatosId" TEXT NOT NULL,
    "totalGastos" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumenDeGastos_pkey" PRIMARY KEY ("resumenDeGatosId")
);

-- CreateTable
CREATE TABLE "GastosPorCategoria" (
    "gastosPorCategoriaId" TEXT NOT NULL,
    "resumenDeGatosId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "categoria" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "GastosPorCategoria_pkey" PRIMARY KEY ("gastosPorCategoriaId")
);

-- AddForeignKey
ALTER TABLE "Ventas" ADD CONSTRAINT "Ventas_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Productos"("productoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compras" ADD CONSTRAINT "Compras_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Productos"("productoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GastosPorCategoria" ADD CONSTRAINT "GastosPorCategoria_resumenDeGatosId_fkey" FOREIGN KEY ("resumenDeGatosId") REFERENCES "ResumenDeGastos"("resumenDeGatosId") ON DELETE RESTRICT ON UPDATE CASCADE;
