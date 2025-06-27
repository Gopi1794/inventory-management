// Importamos los módulos necesarios de Express y Prisma.
import { Request, Response } from "express"; 
import { PrismaClient } from "@prisma/client";

// Inicializamos el cliente de Prisma para interactuar con la base de datos.
const prisma = new PrismaClient();

// Función para obtener productos de la base de datos.
export const getProductos = async (req: Request, res: Response): Promise<void> => {
    try {
        // Extraemos el parámetro de búsqueda desde la query string de la URL.
        const search = req.query.search?.toString();

        // Realizamos una consulta a la base de datos para buscar productos
        // cuyo nombre contenga el término de búsqueda.
        const productos = await prisma.productos.findMany({
            where: {
                nombre: {
                    contains: search,
                    mode: "insensitive", // Filtramos por nombre que contenga el término de búsqueda.
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
    try {
        // Mostramos en consola los datos que estamos recibiendo en el cuerpo de la solicitud (req.body).
        console.log("Datos recibidos:", req.body);

        // Extraemos los datos del cuerpo de la solicitud.
        const { productoId, nombre, precio, categoria, cantidadExistente , proveedor, descripcion } = req.body;

        // Creamos un nuevo producto en la base de datos usando Prisma.
        const productos = await prisma.productos.create({
            data: {
                productoId, // Usamos el ID del producto proporcionado.
                nombre, // Usamos el nombre del producto proporcionado.
                precio: parseFloat(precio), // Aseguramos que el precio sea un número flotante.
                categoria: categoria, // Convertimos la categoría a número flotante si es opcional.
                cantidadExistente,
                proveedor, // Usamos el proveedor del producto proporcionado.
                descripcion, // Usamos la descripción del producto proporcionada.
            },
        });

        // Respondemos con el producto creado en formato JSON y un código de éxito 201 (Creado).
        res.status(201).json(productos);
    } catch (error) {
        // En caso de error, mostramos el error en consola para depuración.
        console.error("Error en createProducto:", error);

        // Convertimos el error a un objeto Error para acceder a la propiedad .message
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";

        // Respondemos con un mensaje de error y un código 500 (Error interno del servidor).
        res.status(500).json({ message: "Error creating product", error: errorMessage });
    }
};
