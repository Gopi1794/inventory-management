import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const dataDir = path.join(__dirname, "seedData");

function readJson(file: string) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf-8"));
}

async function main() {
  // 1. Limpiar tablas en orden inverso a las relaciones
  const deletionOrder = [
    "GastosPorCategoria",
    "ResumenDeGastos",
    "ResumenDeCompras",
    "ResumenDeVentas",
    "Gastos",
    "Ventas",
    "Compras",
    "ProductoUbicacion",
    "Productos",
    "Bin",
    "Rack",
    "Floor",
    "Usuarios",
    "Roles"
  ];
  for (const model of deletionOrder) {
    const prismaModel = (prisma as any)[model.charAt(0).toLowerCase() + model.slice(1)];
    if (prismaModel && prismaModel.deleteMany) {
      await prismaModel.deleteMany();
      console.log(`✅ Cleared ${model}`);
    }
  }

  // 2. Insertar modelos base
  // (Agrega aquí Floor, Rack, Bin si tienes sus JSON)
  // Ejemplo:
  // const floors = readJson("floors.json");
  // if (floors.length) await prisma.floor.createMany({ data: floors });

  // 3. Insertar productos (sin rackId)
  const productos = readJson("productos.json").map((p: any) => {
    // Elimina rackId si existe
    const { rackId, ...rest } = p;
    return rest;
  });
  if (productos.length) {
    await prisma.productos.createMany({ data: productos });
    console.log(`✅ Seeded Productos`);
  }

  // 4. Insertar ubicaciones de productos (ProductoUbicacion)
  // Crea un archivo productoUbicacion.json con [{ productoId, rackId, cantidad }]
  if (fs.existsSync(path.join(dataDir, "productoUbicacion.json"))) {
    const ubicaciones = readJson("productoUbicacion.json");
    if (ubicaciones.length) {
      await prisma.productoUbicacion.createMany({ data: ubicaciones });
      console.log(`✅ Seeded ProductoUbicacion`);
    }
  }

  // 5. Insertar el resto de modelos (Usuarios, Compras, Ventas, etc.)
  const otros = [
    { model: "Usuarios", file: "usuarios.json" },
    { model: "Compras", file: "compras.json" },
    { model: "Ventas", file: "ventas.json" },
    { model: "Gastos", file: "gastos.json" },
    { model: "ResumenDeVentas", file: "resumenDeVentas.json" },
    { model: "ResumenDeCompras", file: "resumenDeCompras.json" },
    { model: "ResumenDeGastos", file: "resumenDeGastos.json" },
    { model: "GastosPorCategoria", file: "gastosPorCategoria.json" }
  ];
  for (const { model, file } of otros) {
    const filePath = path.join(dataDir, file);
    if (fs.existsSync(filePath)) {
      const data = readJson(file);
      if (data.length) {
        const prismaModel = (prisma as any)[model.charAt(0).toLowerCase() + model.slice(1)];
        if (prismaModel && prismaModel.createMany) {
          try {
            await prismaModel.createMany({ data });
            console.log(`✅ Seeded ${model}`);
          } catch (err) {
            console.error(`❌ Error seeding ${model}:`, err);
          }
        }
      }
    }
  }

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("💥 Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });