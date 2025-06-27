"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const racks_1 = require("../controllers/racks");
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
router.post("/", racks_1.createRack);
router.get("/", racks_1.getRacks);
// Endpoint para eliminar un rack
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const rackId = parseInt(id);
        // Primero obtener los pisos del rack
        const rack = yield prisma.rack.findUnique({
            where: { id: rackId },
            include: { floors: true }
        });
        if (!rack) {
            return res.status(404).json({ error: 'Rack no encontrado' });
        }
        // Eliminar todas las ubicaciones de productos en los pisos del rack
        yield prisma.productoUbicacion.deleteMany({
            where: {
                floorId: {
                    in: rack.floors.map(floor => floor.id)
                }
            }
        });
        // Eliminar todos los pisos del rack
        yield prisma.floor.deleteMany({
            where: {
                rackId: rackId
            }
        });
        // Finalmente eliminar el rack
        const deletedRack = yield prisma.rack.delete({
            where: { id: rackId },
            include: { floors: true }
        });
        res.json(deletedRack);
    }
    catch (error) {
        console.error('Error detallado al eliminar el rack:', error);
        res.status(500).json({
            error: 'Error al eliminar el rack',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
}));
router.patch("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { x, y, width, height, locked } = req.body;
        const updatedRack = yield prisma.rack.update({
            where: { id: parseInt(id) },
            data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (x !== undefined && { x: parseFloat(x) })), (y !== undefined && { y: parseFloat(y) })), (width !== undefined && { width: parseFloat(width) })), (height !== undefined && { height: parseFloat(height) })), (locked !== undefined && { locked })),
            include: {
                floors: true
            }
        });
        res.json(updatedRack);
    }
    catch (error) {
        console.error('Error updating rack:', error);
        res.status(500).json({
            error: 'Error updating rack',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}));
exports.default = router;
