import { Router } from "express";
import { getGastosPorCategoria } from "../controllers/gastosControllers";

const router = Router();

router.get("/", getGastosPorCategoria);


export default router;