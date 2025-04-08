"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gastosControllers_1 = require("../controllers/gastosControllers");
const router = (0, express_1.Router)();
router.get("/", gastosControllers_1.getGastosPorCategoria);
exports.default = router;
