import { Router } from 'express';

import rolesRouter from '../roles/routes';
import authRouter from '../auth/login/auth.routes';
import { errorMiddleware } from '../middleware/error.middleware';
import userRouter from '../user/user.routes';
import { validateJWT } from '../middleware/validate-jwt.middleware';
import { loginRateLimiter } from '../auth/login/auth.rate-limit';
import { apiRateLimiter } from './api.rate-limit';
import propertiesRouter from '../properties/properties.routes';
import rentalContractsRouter from '../contracts/contratc.routes';
import paymentsRouter from '../payments/payments.route';
const router = Router();

router.use('/roles', rolesRouter);
router.use('/auth', loginRateLimiter, authRouter);
router.use('/user', validateJWT, apiRateLimiter, userRouter);
router.use('/properties', validateJWT, apiRateLimiter, propertiesRouter);
router.use('/contracts', validateJWT, apiRateLimiter, rentalContractsRouter);
router.use('/payments', validateJWT, apiRateLimiter, paymentsRouter);
router.use(errorMiddleware);

export default router;
