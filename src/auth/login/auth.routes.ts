import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { loginValidator } from './auth.validators';
import { validate } from '../../middleware/validate.middleware';
import { JwtService } from '../../services/jwt.service';
import { loginRateLimiter } from './auth.rate-limit';

const router = Router();

const jwtService = new JwtService();
const authService = new AuthService(jwtService);
const authController = new AuthController(authService);

router.post(
  '/login',
  loginRateLimiter,
  loginValidator,
  validate,
  authController.login,
);

export default router;
