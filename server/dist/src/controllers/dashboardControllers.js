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
const client_1 = require("@prisma/client");
const primas = new client_1.PrismaClient();
const getDashboardMetrics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productosPopulares = yield primas.productos.findMany({
            take: 15,
            orderBy: {
                cantidadExistente: "desc"
            }
        });
        const resumenDeVentas = yield primas.resumenDeVentas.findMany({
            take: 5,
            orderBy: {
                fecha: "desc"
            },
        });
        const resumenDeCompras = yield primas.resumenDeCompras.findMany({
            take: 5,
            orderBy: {
                fecha: "desc"
            },
        });
        const resumenDeGastos = yield primas.resumenDeGastos.findMany({
            take: 5,
            orderBy: {
                fecha: "desc"
            },
        });
        const resumenDeGastosPorCategoríaRaw = yield primas.gastosPorCategoria.findMany({
            take: 5,
            orderBy: {
                fecha: "desc"
            },
        });
        const gastosPorCategoria = resumenDeGastosPorCategoríaRaw.map((item) => (Object.assign(Object.assign({}, item), { total: item.total ? item.total.toString() : "0" })));
        res.json({
            productosPopulares,
            resumenDeVentas,
            resumenDeCompras,
            resumenDeGastos,
            gastosPorCategoria
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error al recibir los datos de la metricas" });
    }
});
exports.getDashboardMetrics = getDashboardMetrics;
