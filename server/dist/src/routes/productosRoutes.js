"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productosControllers_1 = require("../controllers/productosControllers");
const router = (0, express_1.Router)();
router.get("/", productosControllers_1.getProductos);
router.post("/", productosControllers_1.createProducto);
exports.default = router;
