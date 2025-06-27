import express from "express";
import { createProducto, getProductos, updateProductoQR } from "../controllers/productosControllers";

const router = express.Router();

router.get("/", getProductos);
router.post("/", (req, res, next) => {
  console.log("Llega a la ruta POST /api/productos");
  next();
}, createProducto);

// Nueva ruta PATCH para actualizar el QR
router.patch("/:productoId", updateProductoQR);

export default router;