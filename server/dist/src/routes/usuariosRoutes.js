"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usuariosControllers_1 = require("../controllers/usuariosControllers");
const router = (0, express_1.Router)();
router.get("/", usuariosControllers_1.getUsuarios);
exports.default = router;
