import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";


const primas = new PrismaClient();

export const getDashboardMetrics  = async (
    req: Request, 
    res: Response
) : Promise<void> => {
    try {
const productosPopulares = await primas.productos.findMany({
    take: 15,
    orderBy :{
        cantidadExistente : "desc"
    }
});

const resumenDeVentas = await primas.resumenDeVentas.findMany({
    take:5,
    orderBy: {
        fecha:"desc"
    },
}) ;
const resumenDeCompras = await primas.resumenDeCompras.findMany({
    take:5,
    orderBy: {
        fecha:"desc"
    },
}) ;
const resumenDeGastos = await primas.resumenDeGastos.findMany({
    take:5,
    orderBy: {
        fecha:"desc"
    },
}) ;
const resumenDeGastosPorCategoríaRaw = await primas.gastosPorCategoria.findMany({
    take:5,
    orderBy: {
        fecha:"desc"
    },
}) ;
const gastosPorCategoria = resumenDeGastosPorCategoríaRaw.map((item) => ({
    ...item,
    total: item.total ? item.total.toString() : "0",
}));


res.json({
    productosPopulares,
    resumenDeVentas,
    resumenDeCompras,
    resumenDeGastos,
    gastosPorCategoria
});



    }catch(error){
        res.status(500).json ({message :"Error al recibir los datos de la metricas"})
    } 
  

}