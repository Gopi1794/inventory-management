"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const productosControllers_1 = require("../controllers/productosControllers");
const router = express_1.default.Router();
router.get("/", productosControllers_1.getProductos);
router.post("/", (req, res, next) => {
    console.log("Llega a la ruta POST /api/productos");
    next();
}, productosControllers_1.createProducto);
// Nueva ruta PATCH para actualizar el QR
router.patch("/:productoId", productosControllers_1.updateProductoQR);
exports.default = router;
