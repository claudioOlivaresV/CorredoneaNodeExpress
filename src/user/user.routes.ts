import { Router } from 'express';
import { UserController } from './user.contoller';
import {
  createUserValidator,
  updatePasswordValidator,
  updateUserValidator,
  userIdValidator,
} from './user.validator';
import { validate } from '../middleware/validate.middleware';
import { UserService } from './user.service';
import { requireRole } from '../middleware/require-role.middleware';
import { Role } from '../constants/roles.enum';

const userRouter = Router();
const userService = new UserService();

const userController = new UserController(userService);
/**
 * @swagger
 * /api/user:
 *   post:
 *     summary: Crear usuario
 *     description: Crea un nuevo usuario. Solo los administradores pueden realizar esta operación.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role_id
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 150
 *                 example: juan.perez@email.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 maxLength: 128
 *                 example: Password123
 *               role_id:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *                 description: ID del rol que tendrá el usuario
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *       400:
 *         description: Datos de entrada inválidos o rol inexistente/inactivo
 *       401:
 *         description: Token no proporcionado, inválido o expirado
 *       403:
 *         description: El usuario autenticado no tiene permisos de administrador
 *       409:
 *         description: El email ya está registrado o ya existe un administrador
 *       500:
 *         description: Error interno del servidor
 */
userRouter.post(
  '/',
  createUserValidator,
  validate,
  requireRole(Role.ADMIN),
  userController.create,
);

userRouter.patch(
  '/:id',
  userIdValidator,
  updateUserValidator,
  validate,
  requireRole(Role.ADMIN),
  userController.update,
);
userRouter.patch(
  '/:id/password',
  userIdValidator,
  updatePasswordValidator,
  validate,
  requireRole(Role.ADMIN, Role.CORREDOR, Role.ARRENDADOR, Role.ARRENDATARIO),
  userController.updatePassword,
);

/**
 * @swagger
 * /api/user/{id}/deactivate:
 *   patch:
 *     summary: Desactivar usuario
 *     description: Desactiva un usuario. Solo un administrador puede realizar esta operación.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 2
 *     responses:
 *       200:
 *         description: Usuario desactivado correctamente
 *       400:
 *         description: ID inválido o el usuario ya está desactivado
 *       401:
 *         description: Token no proporcionado, inválido o expirado
 *       403:
 *         description: No tienes permisos de administrador
 *       404:
 *         description: Usuario no encontrado
 */
userRouter.patch(
  '/:id/deactivate',
  userIdValidator,
  validate,
  requireRole(Role.ADMIN),
  userController.deactivate,
);

/**
 * @swagger
 * /api/user/{id}/activate:
 *   patch:
 *     summary: Activar usuario
 *     description: Activa un usuario previamente desactivado. Solo un administrador puede realizar esta operación.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 2
 *     responses:
 *       200:
 *         description: Usuario activado correctamente
 *       400:
 *         description: ID inválido o el usuario ya está activado
 *       401:
 *         description: Token no proporcionado, inválido o expirado
 *       403:
 *         description: No tienes permisos de administrador
 *       404:
 *         description: Usuario no encontrado
 */
userRouter.patch(
  '/:id/activate',
  userIdValidator,
  validate,
  requireRole(Role.ADMIN),
  userController.activate,
);
userRouter.get('/', requireRole(Role.ADMIN), userController.getAll);
export default userRouter;
