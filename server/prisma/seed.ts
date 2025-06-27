import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

async function deleteAllData(orderedFileNames: string[]) {
  const modelNames = orderedFileNames.map((fileName) => {
    const modelName = path.basename(fileName, path.extname(fileName));
    return modelName.charAt(0).toUpperCase() + modelName.slice(1);
  });

  for (const modelName of modelNames) {
    const model: any = prisma[modelName as keyof typeof prisma];
    if (model) {
      await model.deleteMany({});
      console.log(`Cleared data from ${modelName}`);
    } else {
      console.error(
        `Model ${modelName} not found. Please ensure the model name is correctly specified.`
      );
    }
  }
}

async function main() {
  const dataDirectory = path.join(__dirname, "seedData");

  const orderedFileNames = [
    "productos.json",
    "resumenDeGastos.json",
    "ventas.json",
    "resumenDeVentas.json",
    "compras.json",
    "resumenDeCompras.json",
    "usuarios.json",
    "gastos.json",
    "gastosPorCategoria.json",
  ];

  await deleteAllData(orderedFileNames);

  for (const fileName of orderedFileNames) {
    const filePath = path.join(dataDirectory, fileName);
    const jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const modelName = path.basename(fileName, path.extname(fileName));
    const model: any = prisma[modelName as keyof typeof prisma];

    if (!model) {
      console.error(`No Prisma model matches the file name: ${fileName}`);
      continue;
    }

    for (const data of jsonData) {
      try {
        await model.create({
          data,
        });
        console.log(`Inserted data into ${modelName}:`, data);
      } catch (error) {
        console.error(`Error inserting data into ${modelName}:`, data, error);
      }
    }

    console.log(`Seeded ${modelName} with data from ${fileName}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { x, y, locked, qrData, productos } = req.body;

    try {
      const rack = await prisma.rack.create({
        data: {
          x,
          y,
          locked,
          qrData,
          productos: {
            create: productos.map((producto: any) => ({
              productoId: producto.productoId,
              nombre: producto.nombre,
              precio: producto.precio,
              cantidadExistente: producto.cantidadExistente,
              categoria: producto.categoria,
            })),
          },
        },
      });

      res.status(201).json(rack);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al crear el rack" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}