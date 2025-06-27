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
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchRack = exports.updateRackPosition = exports.createRack = exports.getRacks = void 0;
const client_1 = require("@prisma/client");
// Inicializamos el cliente de Prisma para interactuar con la base de datos.
const prisma = new client_1.PrismaClient();
const getRacks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Iniciando búsqueda de racks...');
        const racks = yield prisma.rack.findMany({
            include: {
                floors: {
                    include: {
                        ubicaciones: {
                            include: {
                                producto: {
                                    select: {
                                        productoId: true, // Cambiado de id a productoId
                                        nombre: true,
                                        descripcion: true,
                                        cantidadExistente: true, // Cambiado de cantidad a cantidadExistente
                                        categoria: true,
                                        proveedor: true,
                                        precio: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        level: 'asc'
                    }
                }
            },
            orderBy: {
                id: 'asc'
            }
        });
        if (!racks || racks.length === 0) {
            console.log('No se encontraron racks en la base de datos');
            return res.status(200).json([]);
        }
        console.log(`Se encontraron ${racks.length} racks`);
        console.log('Primer rack como ejemplo:', JSON.stringify(racks[0], null, 2));
        res.status(200).json(racks);
    }
    catch (error) {
        console.error("Error detallado al obtener racks:", error);
        // Manejo específico de errores de Prisma
        if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                return res.status(404).json({
                    message: "No se encontraron racks",
                    error: "NOT_FOUND"
                });
            }
        }
        res.status(500).json({
            message: "Error al obtener los racks",
            error: error instanceof Error ? error.message : "Error desconocido"
        });
    }
});
exports.getRacks = getRacks;
const createRack = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Datos recibidos en el servidor:", JSON.stringify(req.body, null, 2));
        const { x, y, locked, qrData, floors } = req.body;
        // Validación más detallada
        const validationErrors = [];
        if (x === undefined || x === null)
            validationErrors.push("x es requerido");
        if (y === undefined || y === null)
            validationErrors.push("y es requerido");
        if (typeof locked !== 'boolean')
            validationErrors.push("locked debe ser un booleano");
        if (!qrData)
            validationErrors.push("qrData es requerido");
        if (!Array.isArray(floors)) {
            validationErrors.push("floors debe ser un array");
        }
        else {
            floors.forEach((floor, index) => {
                if (!floor.name)
                    validationErrors.push(`El piso ${index + 1} requiere un nombre`);
                if (floor.level === undefined || floor.level === null)
                    validationErrors.push(`El piso ${index + 1} requiere un nivel`);
            });
        }
        if (validationErrors.length > 0) {
            console.log("Errores de validación:", validationErrors);
            return res.status(400).json({
                message: "Datos inválidos",
                errors: validationErrors,
                receivedData: { x, y, locked, qrData, floors }
            });
        }
        // Convertir valores a los tipos correctos y crear el rack
        const rack = yield prisma.rack.create({
            data: {
                x: Number(x),
                y: Number(y),
                locked: Boolean(locked),
                qrData: String(qrData),
                floors: {
                    create: floors.map((floor) => ({
                        name: String(floor.name),
                        level: Number(floor.level)
                    }))
                }
            },
            include: {
                floors: true // Cambiado de floor a floors
            }
        });
        console.log("Rack creado exitosamente:", JSON.stringify(rack, null, 2));
        res.status(201).json(rack);
    }
    catch (error) {
        console.error("Error detallado al crear rack:", error);
        res.status(500).json({
            message: "Error al crear el rack",
            error: error instanceof Error ? error.message : "Error desconocido"
        });
    }
});
exports.createRack = createRack;
const updateRackPosition = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { x, y } = req.body;
        // Validación
        if (x === undefined || x === null) {
            return res.status(400).json({ message: "x es requerido" });
        }
        if (y === undefined || y === null) {
            return res.status(400).json({ message: "y es requerido" });
        }
        const rack = yield prisma.rack.update({
            where: { id: parseInt(id) },
            data: {
                x: Number(x),
                y: Number(y)
            },
            include: {
                floors: true // Incluir los pisos en la respuesta
            }
        });
        res.status(200).json(rack);
    }
    catch (error) {
        console.error("Error al actualizar la posición del rack:", error);
        res.status(500).json({
            message: "Error al actualizar la posición del rack",
            error: error instanceof Error ? error.message : "Error desconocido"
        });
    }
});
exports.updateRackPosition = updateRackPosition;
// PATCH /api/racks/:id
const patchRack = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { x, y, width, height } = req.body;
    // Actualiza solo los campos recibidos
    const updated = yield prisma.rack.update({
        where: { id: Number(id) },
        data: { x, y, width, height },
    });
    res.json(updated);
});
exports.patchRack = patchRack;
