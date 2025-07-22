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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
const dataDir = path_1.default.join(__dirname, "seedData");
function readJson(file) {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.join(dataDir, file), "utf-8"));
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // 1. Limpiar tablas en orden inverso a las relaciones
        const deletionOrder = [
            "GastosPorCategoria",
            "ResumenDeGastos",
            "ResumenDeCompras",
            "ResumenDeVentas",
            "Gastos",
            "Ventas",
            "Compras",
            "ProductoUbicacion",
            "Productos",
            "Rack",
            "Floor",
            "Usuarios",
            "Roles"
        ];
        for (const model of deletionOrder) {
            const prismaModel = prisma[model.charAt(0).toLowerCase() + model.slice(1)];
            if (prismaModel && prismaModel.deleteMany) {
                yield prismaModel.deleteMany();
                console.log(`✅ Cleared ${model}`);
            }
        }
        // 2. Insertar modelos base
        // (Agrega aquí Floor, Rack, Bin si tienes sus JSON)
        // Ejemplo:
        // const floors = readJson("floors.json");
        // if (floors.length) await prisma.floor.createMany({ data: floors });
        // 3. Insertar productos (sin rackId)
        const productos = readJson("productos.json").map((p) => {
            // Elimina rackId si existe
            const { rackId } = p, rest = __rest(p, ["rackId"]);
            return rest;
        });
        if (productos.length) {
            yield prisma.productos.createMany({ data: productos });
            console.log(`✅ Seeded Productos`);
        }
        // 4. Insertar ubicaciones de productos (ProductoUbicacion)
        // Crea un archivo productoUbicacion.json con [{ productoId, rackId, cantidad }]
        if (fs_1.default.existsSync(path_1.default.join(dataDir, "productoUbicacion.json"))) {
            const ubicaciones = readJson("productoUbicacion.json");
            if (ubicaciones.length) {
                yield prisma.productoUbicacion.createMany({ data: ubicaciones });
                console.log(`✅ Seeded ProductoUbicacion`);
            }
        }
        // 5. Insertar el resto de modelos (Usuarios, Compras, Ventas, etc.)
        const otros = [
            { model: "Usuarios", file: "usuarios.json" },
            { model: "Compras", file: "compras.json" },
            { model: "Ventas", file: "ventas.json" },
            { model: "Gastos", file: "gastos.json" },
            { model: "ResumenDeVentas", file: "resumenDeVentas.json" },
            { model: "ResumenDeCompras", file: "resumenDeCompras.json" },
            { model: "ResumenDeGastos", file: "resumenDeGastos.json" },
            { model: "GastosPorCategoria", file: "gastosPorCategoria.json" },
            { model: "Roles", file: "roles.json" }
        ];
        for (const { model, file } of otros) {
            const filePath = path_1.default.join(dataDir, file);
            if (fs_1.default.existsSync(filePath)) {
                const data = readJson(file);
                if (data.length) {
                    const prismaModel = prisma[model.charAt(0).toLowerCase() + model.slice(1)];
                    if (prismaModel && prismaModel.createMany) {
                        try {
                            yield prismaModel.createMany({ data });
                            console.log(`✅ Seeded ${model}`);
                        }
                        catch (err) {
                            console.error(`❌ Error seeding ${model}:`, err);
                        }
                    }
                }
            }
        }
        console.log("🎉 Database seeding completed successfully!");
    });
}
main()
    .catch((e) => {
    console.error("💥 Error during seeding:", e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
