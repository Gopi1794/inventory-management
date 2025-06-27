import express from "express";
import { createRack, getRacks, updateRackPosition } from "../controllers/racks";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/", createRack);
router.get("/", getRacks);

// Endpoint para eliminar un rack
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const rackId = parseInt(id);

        // Primero obtener los pisos del rack
        const rack = await prisma.rack.findUnique({
            where: { id: rackId },
            include: { floors: true }
        });

        if (!rack) {
            return res.status(404).json({ error: 'Rack no encontrado' });
        }

        // Eliminar todas las ubicaciones de productos en los pisos del rack
        await prisma.productoUbicacion.deleteMany({
            where: {
                floorId: {
                    in: rack.floors.map(floor => floor.id)
                }
            }
        });

        // Eliminar todos los pisos del rack
        await prisma.floor.deleteMany({
            where: {
                rackId: rackId
            }
        });

        // Finalmente eliminar el rack
        const deletedRack = await prisma.rack.delete({
            where: { id: rackId },
            include: { floors: true }
        });

        res.json(deletedRack);
    } catch (error) {
        console.error('Error detallado al eliminar el rack:', error);
        res.status(500).json({
            error: 'Error al eliminar el rack',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});

router.patch("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { x, y, width, height, locked } = req.body;

        const updatedRack = await prisma.rack.update({
            where: { id: parseInt(id) },
            data: {
                ...(x !== undefined && { x: parseFloat(x) }),
                ...(y !== undefined && { y: parseFloat(y) }),
                ...(width !== undefined && { width: parseFloat(width) }),
                ...(height !== undefined && { height: parseFloat(height) }),
                ...(locked !== undefined && { locked }),
            },
            include: {
                floors: true
            }
        });

        res.json(updatedRack);
    } catch (error) {
        console.error('Error updating rack:', error);
        res.status(500).json({
            error: 'Error updating rack',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

export default router;