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
exports.createProducto = exports.getProductos = void 0;
const client_1 = require("@prisma/client");
// Inicializamos el cliente de Prisma para interactuar con la base de datos.
const prisma = new client_1.PrismaClient();
// Función para obtener productos de la base de datos.
const getProductos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Extraemos el parámetro de búsqueda desde la query string de la URL.
        const search = (_a = req.query.search) === null || _a === void 0 ? void 0 : _a.toString();
        // Realizamos una consulta a la base de datos para buscar productos
        // cuyo nombre contenga el término de búsqueda.
        const productos = yield prisma.productos.findMany({
            where: {
                nombre: {
                    contains: search,
                    mode: "insensitive", // Filtramos por nombre que contenga el término de búsqueda.
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
    try {
        // Mostramos en consola los datos que estamos recibiendo en el cuerpo de la solicitud (req.body).
        console.log("Datos recibidos:", req.body);
        // Extraemos los datos del cuerpo de la solicitud.
        const { productoId, nombre, precio, categoria, cantidadExistente, proveedor, descripcion } = req.body;
        // Creamos un nuevo producto en la base de datos usando Prisma.
        const productos = yield prisma.productos.create({
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
    }
    catch (error) {
        // En caso de error, mostramos el error en consola para depuración.
        console.error("Error en createProducto:", error);
        // Convertimos el error a un objeto Error para acceder a la propiedad .message
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
        // Respondemos con un mensaje de error y un código 500 (Error interno del servidor).
        res.status(500).json({ message: "Error creating product", error: errorMessage });
    }
});
exports.createProducto = createProducto;
