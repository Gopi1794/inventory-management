// Importamos los módulos necesarios de Express y Prisma.
import { Request, Response } from "express"; 
import { Prisma, PrismaClient } from "@prisma/client";

// Inicializamos el cliente de Prisma para interactuar con la base de datos.
const prisma = new PrismaClient();

// Función para obtener productos de la base de datos.
export const getProductos = async (req: Request, res: Response): Promise<void> => {
    try {
        // Extraemos el parámetro de búsqueda desde la query string de la URL.
        const search = req.query.search?.toString() || "";
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = (page - 1) * limit;

        // Realizamos una consulta a la base de datos para buscar productos
        // cuyo nombre contenga el término de búsqueda.
        const filters: Prisma.ProductosWhereInput[] = [];

        if (search) {
          filters.push({ nombre: { contains: search, mode: "insensitive" } });
        }
        if (req.query.categoria) {
          filters.push({ categoria: Number(req.query.categoria) });
        }
        if (req.query.proveedor) {
          filters.push({ proveedor: { contains: req.query.proveedor as string, mode: "insensitive" } });
        }
        if (req.query.precioMin) {
          filters.push({ precio: { gte: Number(req.query.precioMin) } });
        }
        if (req.query.precioMax) {
          filters.push({ precio: { lte: Number(req.query.precioMax) } });
        }

        const where: Prisma.ProductosWhereInput = filters.length > 0 ? { AND: filters } : {};

        const productos = await prisma.productos.findMany({
            where,
            skip,
            take: limit,
            orderBy: { nombre: "asc" },
            include: {
                ubicaciones: {
                    include: {
                        floor: true, // Esto trae el nombre y el nivel del piso
                    },
                },
            },
        });

        // Respondemos con los productos encontrados en formato JSON.
        res.json(productos);
    } catch (error) {
        // En caso de error, respondemos con un mensaje de error y un código 500 (Error interno del servidor).
        res.status(500).json({ message: "Error al encontrar los productos" });
    }
};

// Función para crear un nuevo producto en la base de datos.
export const createProducto = async (req: Request, res: Response) => {
    // Aquí pones el console.log
    console.log("Body recibido en createProducto:", req.body);

    try {
        const { productoId, nombre, precio, categoria, cantidadExistente, proveedor, descripcion, qr_url, ubicaciones } = req.body;

        const now = new Date();

        // 1. Crear el producto
        const producto = await prisma.productos.create({
            data: {
                productoId,
                nombre,
                precio: parseFloat(precio),
                categoria,
                cantidadExistente: Number(cantidadExistente), 
                proveedor,
                descripcion,
                qr_url: qr_url || null,
                fechaDeCreacion: now,
                fechaDeModificacion: now,
            },
        });

        // 2. Crear las ubicaciones asociadas
        if (ubicaciones && Array.isArray(ubicaciones)) {
            await Promise.all(
                ubicaciones.map((ubic: { floorId: number }) =>
                    prisma.productoUbicacion.create({
                        data: {
                            productoId: producto.productoId,
                            floorId: ubic.floorId,
                            // cantidad: 1 // puedes dejarlo así o permitir editarlo
                        },
                    })
                )
            );
        }

        res.status(201).json(producto);
    } catch (error) {
        console.error("Error en createProducto:", error);
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
        res.status(500).json({ message: "Error creating product", error: errorMessage });
    }
};

export const updateProductoQR = async (req: Request, res: Response) => {
  const { productoId } = req.params;
  const { qr_url } = req.body;
  try {
    const producto = await prisma.productos.update({
      where: { productoId },
      data: { qr_url },
    });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ message: "Error actualizando QR", error });
  }
};
