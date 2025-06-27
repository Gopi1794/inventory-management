"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importamos los módulos necesarios
const express_1 = __importDefault(require("express")); // Framework para crear el servidor y manejar rutas
const dotenv_1 = __importDefault(require("dotenv")); // Carga variables de entorno desde un archivo .env
const cors_1 = __importDefault(require("cors")); // Habilita CORS (permite que se hagan peticiones desde otros dominios)
const helmet_1 = __importDefault(require("helmet")); // Agrega cabeceras de seguridad a las respuestas HTTP
const morgan_1 = __importDefault(require("morgan")); // Middleware para registrar peticiones HTTP en la consola
// Importamos las rutas de cada módulo
const dashboardRoutes_1 = __importDefault(require("./routes/dashboardRoutes"));
const productosRoutes_1 = __importDefault(require("./routes/productosRoutes"));
const usuariosRoutes_1 = __importDefault(require("./routes/usuariosRoutes"));
const gastosRoutes_1 = __importDefault(require("./routes/gastosRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const rackRoutes_1 = __importDefault(require("./routes/rackRoutes"));
// =======================
// CONFIGURACIÓN DEL SERVIDOR
// =======================
// Cargamos las variables de entorno del archivo .env
dotenv_1.default.config();
// Inicializamos la aplicación Express
const app = (0, express_1.default)();
// Middleware para parsear datos JSON entrantes
app.use(express_1.default.json());
// Middleware para parsear datos de formularios (URL-encoded)
app.use(express_1.default.urlencoded({ extended: false }));
// Middleware para permitir solicitudes desde otros orígenes (CORS)
app.use((0, cors_1.default)());
// Middleware para agregar seguridad a las cabeceras HTTP
app.use((0, helmet_1.default)());
// Middleware para registrar las peticiones HTTP (método, ruta, status, etc.)
app.use((0, morgan_1.default)("common"));
// =======================
// DEFINICIÓN DE RUTAS
// =======================
// Ruta base para dashboard (ej: GET http://localhost:3002/api/dashboard)
app.use("/api/dashboard", dashboardRoutes_1.default);
// Ruta base para productos (ej: GET http://localhost:3002/api/productos)
app.use("/api/productos", productosRoutes_1.default);
// Ruta base para usuarios (ej: GET http://localhost:3002/api/usuarios)
app.use("/api/usuarios", usuariosRoutes_1.default);
// Ruta base para gastos (ej: GET http://localhost:3002/api/gastos)
app.use("/api/gastos", gastosRoutes_1.default);
app.use("/api/authRoutes", authRoutes_1.default);
app.use("/api/rackRoutes", rackRoutes_1.default);
// Ruta base para racks (ej: GET http://localhost:3002/api/rackRoutes)
// =======================
// INICIAR EL SERVIDOR
// =======================
// Obtenemos el puerto del archivo .env o usamos el 3002 por defecto
const port = process.env.PORT || 3002;
// Iniciamos el servidor y escuchamos en el puerto especificado
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
