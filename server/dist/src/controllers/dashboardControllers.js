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
exports.getDashboardMetrics = void 0;
// Importación del cliente de Prisma, que permite interactuar con la base de datos
const client_1 = require("@prisma/client");
// Creación de una instancia del cliente de Prisma
const primas = new client_1.PrismaClient();
// Función asincrónica que obtiene distintas métricas para el dashboard
const getDashboardMetrics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Obtiene los 15 productos con mayor cantidad existente, ordenados de forma descendente
        const productosPopulares = yield primas.productos.findMany({
            take: 15,
            orderBy: {
                cantidadExistente: "desc"
            }
        });
        // Obtiene los 5 registros más recientes del resumen de ventas, ordenados por fecha descendente
        const resumenDeVentas = yield primas.resumenDeVentas.findMany({
            take: 5,
            orderBy: {
                fecha: "desc"
            },
        });
        // Obtiene los 5 registros más recientes del resumen de compras, ordenados por fecha descendente
        const resumenDeCompras = yield primas.resumenDeCompras.findMany({
            take: 5,
            orderBy: {
                fecha: "desc"
            },
        });
        // Obtiene los 5 registros más recientes del resumen de gastos, ordenados por fecha descendente
        const resumenDeGastos = yield primas.resumenDeGastos.findMany({
            take: 5,
            orderBy: {
                fecha: "desc"
            },
        });
        // Obtiene los 5 registros más recientes de los gastos por categoría, ordenados por fecha descendente
        const resumenDeGastosPorCategoríaRaw = yield primas.gastosPorCategoria.findMany({
            take: 5,
            orderBy: {
                fecha: "desc"
            },
        });
        // Transforma los resultados para asegurarse de que el campo `total` sea un string.
        // Esto puede evitar errores si el campo es un Decimal u otro tipo no serializable directamente en JSON
        const gastosPorCategoria = resumenDeGastosPorCategoríaRaw.map((item) => (Object.assign(Object.assign({}, item), { total: item.total ? item.total.toString() : "0" })));
        // Devuelve toda la información recopilada en un objeto JSON al cliente
        res.json({
            productosPopulares,
            resumenDeVentas,
            resumenDeCompras,
            resumenDeGastos,
            gastosPorCategoria
        });
    }
    catch (error) {
        // En caso de que ocurra un error en cualquiera de las consultas, se envía un mensaje de error con código 500
        res.status(500).json({ message: "Error al recibir los datos de las métricas" });
    }
});
exports.getDashboardMetrics = getDashboardMetrics;
