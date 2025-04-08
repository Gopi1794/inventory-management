import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

// Función para obtener productos de la base de datos.
export const getUsuarios = async (req: Request, res: Response): Promise<void> => {
    try {
const usuarios = await prisma.usuarios.findMany();
res.json(usuarios);
    }

    catch(error){
        res.status(500).json( {message: "Error al conseguir los usuarios"});
    }
}