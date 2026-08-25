import { Router } from "express";
import rolesRouter from "../roles/routes";

const router = Router();

router.use("/roles", rolesRouter);

export default router;
