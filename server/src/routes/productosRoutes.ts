import { Router } from "express";
import { createProducto, getProductos } from "../controllers/productosControllers";

const router = Router();

router.get("/", getProductos);
router.post("/", createProducto);

export default router;