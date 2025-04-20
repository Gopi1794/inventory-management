import { Router } from "express";
import { postLogin } from "../controllers/auth";

const router = Router();

router.post("/login", postLogin); // <-- esta es la ruta que debe existir

export default router;
