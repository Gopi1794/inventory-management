// Importación de los tipos Request y Response desde Express para tipar las solicitudes y respuestas HTTP
import { Request, Response } from "express";

// Importación del cliente de Prisma, que permite interactuar con la base de datos
import { PrismaClient } from "@prisma/client";

// Creación de una instancia del cliente de Prisma
const primas = new PrismaClient();

// Función asincrónica que obtiene distintas métricas para el dashboard
export const getDashboardMetrics  = async (
    req: Request, 
    res: Response
) : Promise<void> => {
    try {
        // Obtiene los 15 productos con mayor cantidad existente, ordenados de forma descendente
        const productosPopulares = await primas.productos.findMany({
            take: 15,
            orderBy: {
                cantidadExistente: "desc"
            }
        });

        // Obtiene los 5 registros más recientes del resumen de ventas, ordenados por fecha descendente
        const resumenDeVentas = await primas.resumenDeVentas.findMany({
            take: 5,
            orderBy: {
                fecha: "desc"
            },
        });

        // Obtiene los 5 registros más recientes del resumen de compras, ordenados por fecha descendente
        const resumenDeCompras = await primas.resumenDeCompras.findMany({
            take: 5,
            orderBy: {
                fecha: "desc"
            },
        });

        // Obtiene los 5 registros más recientes del resumen de gastos, ordenados por fecha descendente
        const resumenDeGastos = await primas.resumenDeGastos.findMany({
            take: 5,
            orderBy: {
                fecha: "desc"
            },
        });

        // Obtiene los 5 registros más recientes de los gastos por categoría, ordenados por fecha descendente
        const resumenDeGastosPorCategoríaRaw = await primas.gastosPorCategoria.findMany({
            take: 5,
            orderBy: {
                fecha: "desc"
            },
        });

        // Transforma los resultados para asegurarse de que el campo `total` sea un string.
        // Esto puede evitar errores si el campo es un Decimal u otro tipo no serializable directamente en JSON
        const gastosPorCategoria = resumenDeGastosPorCategoríaRaw.map((item) => ({
            ...item,
            total: item.total ? item.total.toString() : "0",
          }));

        // Devuelve toda la información recopilada en un objeto JSON al cliente
        res.json({
            productosPopulares,
            resumenDeVentas,
            resumenDeCompras,
            resumenDeGastos,
            gastosPorCategoria
        });

    } catch (error) {
        // En caso de que ocurra un error en cualquiera de las consultas, se envía un mensaje de error con código 500
        res.status(500).json({ message: "Error al recibir los datos de las métricas" });
    }
};
