// Importamos los módulos necesarios de Express y Prisma.
import { Request, Response } from "express"; 
import { PrismaClient } from "@prisma/client";

// Inicializamos el cliente de Prisma para interactuar con la base de datos.
const prisma = new PrismaClient();

export const getGastosPorCategoria = async (req: Request, res: Response): Promise<void> => {
    try {
        const getGastosPorCategoriaResumenRaw = await prisma.gastosPorCategoria.findMany({
            orderBy: {
                fecha: "desc",
            },
    }
);
        const getGastosPorCategoriaResumen = getGastosPorCategoriaResumenRaw.map(
            (item ) => ({
                ...item,
                total: item.total.toString()
            
        }));

        res.json(getGastosPorCategoriaResumen);
    }
    catch(error){
        res.status(500).json({ message: "Error al encontrar los gastos por categoria" });
    
}
}