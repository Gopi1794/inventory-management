import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const postLogin = async (req: Request, res: Response): Promise<Response> => {
  const { username, contrasena } = req.body;

  try {
    const user = await prisma.roles.findFirst({
      where: { nombre_usuario: username },
    });

    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado" });
    }

    // Comparación directa sin bcrypt
    if (contrasena !== user.contrasena) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user.id, rol: user.rol },
      process.env.JWT_SECRET || "clave-ultra-secreta",
      { expiresIn: "1h" }
    );

    return res.json({ token, rol: user.rol });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};
