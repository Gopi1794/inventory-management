import { Router } from "express";
import {postLogin} from "../controllers/auth";

const router = Router();

router.post("/login", postLogin); // POST http://localhost:3002/api/login

export default router;
