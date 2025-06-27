// Importamos los módulos necesarios
import express from "express"; // Framework para crear el servidor y manejar rutas
import dotenv from "dotenv"; // Carga variables de entorno desde un archivo .env
import cors from "cors"; // Habilita CORS (permite que se hagan peticiones desde otros dominios)
import helmet from "helmet"; // Agrega cabeceras de seguridad a las respuestas HTTP
import morgan from "morgan"; // Middleware para registrar peticiones HTTP en la consola

// Importamos las rutas de cada módulo
import dashboardRoutes from "./routes/dashboardRoutes";
import productosRoutes from "./routes/productosRoutes";
import usuariosRouters from "./routes/usuariosRoutes";
import gastosRoutes from "./routes/gastosRoutes";
import authRoutes from "./routes/authRoutes";
import rackRoutes from "./routes/rackRoutes";



// =======================
// CONFIGURACIÓN DEL SERVIDOR
// =======================

// Cargamos las variables de entorno del archivo .env
dotenv.config();

// Inicializamos la aplicación Express
const app = express();

// Middleware para parsear datos JSON entrantes
app.use(express.json());

// Middleware para parsear datos de formularios (URL-encoded)
app.use(express.urlencoded({ extended: false }));

// Middleware para permitir solicitudes desde otros orígenes (CORS)
app.use(cors());

// Middleware para agregar seguridad a las cabeceras HTTP
app.use(helmet());

// Middleware para registrar las peticiones HTTP (método, ruta, status, etc.)
app.use(morgan("common"));

// =======================
// DEFINICIÓN DE RUTAS
// =======================

// Ruta base para dashboard (ej: GET http://localhost:3002/api/dashboard)
app.use("/api/dashboard", dashboardRoutes);

// Ruta base para productos (ej: GET http://localhost:3002/api/productos)
app.use("/api/productos", productosRoutes);

// Ruta base para usuarios (ej: GET http://localhost:3002/api/usuarios)
app.use("/api/usuarios", usuariosRouters);

// Ruta base para gastos (ej: GET http://localhost:3002/api/gastos)
app.use("/api/gastos", gastosRoutes);

app.use("/api/authRoutes", authRoutes);

app.use("/api/rackRoutes", rackRoutes); 
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
