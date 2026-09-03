import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { loginValidator } from './auth.validators';
import { validate } from '../../middleware/validate.middleware';
import { JwtService } from '../../services/jwt.service';

const router = Router();

const jwtService = new JwtService();
const authService = new AuthService(jwtService);
const authController = new AuthController(authService);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags:
 *       - Auth - login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@test.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', loginValidator, validate, authController.login);

export default router;
