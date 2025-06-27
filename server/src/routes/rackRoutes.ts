import express from "express";
import { createRack } from "../controllers/racks";

const router = express.Router();

router.post("/login", createRack);

export default router;