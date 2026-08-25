import { Router } from "express";
import { prisma } from "../config/prismaConfig";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const roles = await prisma.roles.findMany();

    res.json(roles);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Error al obtener los roles",
    });
  }
});

export default router;
