import { Request, Response } from "express"; 
import { PrismaClient } from "@prisma/client";

// Inicializamos el cliente de Prisma para interactuar con la base de datos.
const prisma = new PrismaClient();

export const createRack = async (req: Request, res: Response) => {
    try {
        // Mostramos en consola los datos que estamos recibiendo en el cuerpo de la solicitud (req.body).
        console.log("Datos recibidos:", req.body);

        // Extraemos los datos del cuerpo de la solicitud.
        const {  x, y, locked, qrData , productos} = req.body;

        // Validación básica de los datos
        if (typeof x !== "number" || typeof y !== "number" || typeof locked !== "boolean" || typeof qrData !== "string") {
            return res.status(400).json({ message: "Datos inválidos. Verifica los campos enviados." });
        }

        // Creamos un nuevo rack en la base de datos usando Prisma.
        const rack = await prisma.rack.create({
            data: {
                 // Usamos el ID del producto proporcionado.
                x, // Usamos el nombre del producto proporcionado.
                y, // Aseguramos que el precio sea un número flotante.
                locked,
                qrData,
                productos:{
                    create: productos?.map((producto: any) => ({
                        productoId: producto.productoId,
                        nombre: producto.nombre,
                        precio: producto.precio,
                        cantidadExistente: producto.cantidadExistente,
                        categoria: producto.categoria,
                        descripcion: producto.descripcion,
                        proveedor: producto.proveedor,
                    })),
                } // Usamos la descripción del producto proporcionada.
            },
        });

        // Respondemos con el producto creado en formato JSON y un código de éxito 201 (Creado).
        res.status(201).json(rack);
    } catch (error) {
        // En caso de error, mostramos el error en consola para depuración.
        console.error("Error en createRack:", error);

        // Convertimos el error a un objeto Error para acceder a la propiedad .message
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";

        // Respondemos con un mensaje de error y un código 500 (Error interno del servidor).
        res.status(500).json({ message: "Error al crear el rack", error: errorMessage });
    }
};