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
exports.updateProductoQR = exports.createProducto = exports.getProductos = void 0;
const client_1 = require("@prisma/client");
// Inicializamos el cliente de Prisma para interactuar con la base de datos.
const prisma = new client_1.PrismaClient();
// Función para obtener productos de la base de datos.
const getProductos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Extraemos el parámetro de búsqueda desde la query string de la URL.
        const search = ((_a = req.query.search) === null || _a === void 0 ? void 0 : _a.toString()) || "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;
        // Realizamos una consulta a la base de datos para buscar productos
        // cuyo nombre contenga el término de búsqueda.
        const filters = [];
        if (search) {
            filters.push({ nombre: { contains: search, mode: "insensitive" } });
        }
        if (req.query.categoria) {
            filters.push({ categoria: Number(req.query.categoria) });
        }
        if (req.query.proveedor) {
            filters.push({ proveedor: { contains: req.query.proveedor, mode: "insensitive" } });
        }
        if (req.query.precioMin) {
            filters.push({ precio: { gte: Number(req.query.precioMin) } });
        }
        if (req.query.precioMax) {
            filters.push({ precio: { lte: Number(req.query.precioMax) } });
        }
        const where = filters.length > 0 ? { AND: filters } : {};
        const productos = yield prisma.productos.findMany({
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
    }
    catch (error) {
        // En caso de error, respondemos con un mensaje de error y un código 500 (Error interno del servidor).
        res.status(500).json({ message: "Error al encontrar los productos" });
    }
});
exports.getProductos = getProductos;
// Función para crear un nuevo producto en la base de datos.
const createProducto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Aquí pones el console.log
    console.log("Body recibido en createProducto:", req.body);
    try {
        const { productoId, nombre, precio, categoria, cantidadExistente, proveedor, descripcion, qr_url, ubicaciones } = req.body;
        const now = new Date();
        // 1. Crear el producto
        const producto = yield prisma.productos.create({
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
            yield Promise.all(ubicaciones.map((ubic) => prisma.productoUbicacion.create({
                data: {
                    productoId: producto.productoId,
                    floorId: ubic.floorId,
                    // cantidad: 1 // puedes dejarlo así o permitir editarlo
                },
            })));
        }
        res.status(201).json(producto);
    }
    catch (error) {
        console.error("Error en createProducto:", error);
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
        res.status(500).json({ message: "Error creating product", error: errorMessage });
    }
});
exports.createProducto = createProducto;
const updateProductoQR = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productoId } = req.params;
    const { qr_url } = req.body;
    try {
        const producto = yield prisma.productos.update({
            where: { productoId },
            data: { qr_url },
        });
        res.json(producto);
    }
    catch (error) {
        res.status(500).json({ message: "Error actualizando QR", error });
    }
});
exports.updateProductoQR = updateProductoQR;
