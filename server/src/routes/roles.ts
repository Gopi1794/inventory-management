import { Router } from "express";
import { login } from "../controllers/auth";

const router = Router();

router.post("/login", login); // POST http://localhost:3002/api/login

export default router;
