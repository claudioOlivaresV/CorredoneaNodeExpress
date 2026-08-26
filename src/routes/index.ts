import { Router } from 'express';

import rolesRouter from '../roles/routes';
import authRouter from '../auth/login/auth.routes';
import { errorMiddleware } from '../middleware/error.middleware';
const router = Router();

router.use('/roles', rolesRouter);
router.use('/auth', authRouter);
router.use(errorMiddleware);

export default router;
