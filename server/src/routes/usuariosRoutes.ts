import { Router } from "express";
import { getUsuarios } from "../controllers/usuariosControllers";

const router = Router();

router.get("/", getUsuarios);

export default router;