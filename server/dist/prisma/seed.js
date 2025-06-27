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
exports.default = handler;
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
function deleteAllData(orderedFileNames) {
    return __awaiter(this, void 0, void 0, function* () {
        const modelNames = orderedFileNames.map((fileName) => {
            const modelName = path_1.default.basename(fileName, path_1.default.extname(fileName));
            return modelName.charAt(0).toUpperCase() + modelName.slice(1);
        });
        for (const modelName of modelNames) {
            const model = prisma[modelName];
            if (model) {
                yield model.deleteMany({});
                console.log(`Cleared data from ${modelName}`);
            }
            else {
                console.error(`Model ${modelName} not found. Please ensure the model name is correctly specified.`);
            }
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const dataDirectory = path_1.default.join(__dirname, "seedData");
        const orderedFileNames = [
            "productos.json",
            "resumenDeGastos.json",
            "ventas.json",
            "resumenDeVentas.json",
            "compras.json",
            "resumenDeCompras.json",
            "usuarios.json",
            "gastos.json",
            "gastosPorCategoria.json",
        ];
        yield deleteAllData(orderedFileNames);
        for (const fileName of orderedFileNames) {
            const filePath = path_1.default.join(dataDirectory, fileName);
            const jsonData = JSON.parse(fs_1.default.readFileSync(filePath, "utf-8"));
            const modelName = path_1.default.basename(fileName, path_1.default.extname(fileName));
            const model = prisma[modelName];
            if (!model) {
                console.error(`No Prisma model matches the file name: ${fileName}`);
                continue;
            }
            for (const data of jsonData) {
                try {
                    yield model.create({
                        data,
                    });
                    console.log(`Inserted data into ${modelName}:`, data);
                }
                catch (error) {
                    console.error(`Error inserting data into ${modelName}:`, data, error);
                }
            }
            console.log(`Seeded ${modelName} with data from ${fileName}`);
        }
    });
}
main()
    .catch((e) => {
    console.error(e);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
function handler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.method === "POST") {
            const { x, y, locked, qrData, productos } = req.body;
            try {
                const rack = yield prisma.rack.create({
                    data: {
                        x,
                        y,
                        locked,
                        qrData,
                        productos: {
                            create: productos.map((producto) => ({
                                productoId: producto.productoId,
                                nombre: producto.nombre,
                                precio: producto.precio,
                                cantidadExistente: producto.cantidadExistente,
                                categoria: producto.categoria,
                            })),
                        },
                    },
                });
                res.status(201).json(rack);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: "Error al crear el rack" });
            }
        }
        else {
            res.setHeader("Allow", ["POST"]);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    });
}
