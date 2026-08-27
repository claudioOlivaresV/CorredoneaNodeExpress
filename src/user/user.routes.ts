import { Router } from 'express';
import { UserController } from './user.contoller';
import { createUserValidator } from './user.validator';
import { validate } from '../middleware/validate.middleware';
import { UserService } from './user.service';
import { requireRole } from '../middleware/require-role.middleware';
import { Role } from '../constants/roles.enum';

const userRouter = Router();
const userService = new UserService();

const userController = new UserController(userService);

userRouter.post(
  '/',
  createUserValidator,
  validate,
  requireRole(Role.ADMIN),
  userController.create,
  userController.create,
);

userRouter.patch('/:id', requireRole(Role.ADMIN), userController.update);

userRouter.patch(
  '/:id/password',
  requireRole(Role.ADMIN, Role.CORREDOR, Role.ARRENDADOR, Role.ARRENDATARIO),
  userController.updatePassword,
);

userRouter.patch(
  '/:id/deactivate',
  requireRole(Role.ADMIN),
  userController.deactivate,
);

userRouter.patch(
  '/:id/activate',
  requireRole(Role.ADMIN),
  userController.activate,
);

export default userRouter;
