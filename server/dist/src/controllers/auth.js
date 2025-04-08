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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Login = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const Login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, contrasena } = req.body;
    try {
        const user = yield prisma.roles.findUnique({
            where: { nombre_usuario: username },
        });
        if (!user) {
            return res.status(401).json({ message: "Usuario no encontrado" });
        }
        const validcontrasena = yield bcrypt_1.default.compare(contrasena, user.contrasena);
        if (!validcontrasena) {
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET || "clave-ultra-secreta", { expiresIn: "1h" });
        return res.json({ token, rol: user.rol });
    }
    catch (error) {
        console.error("Error en login:", error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
});
exports.Login = Login;
