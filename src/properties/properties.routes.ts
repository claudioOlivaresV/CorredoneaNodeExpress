import { Router } from 'express';
// import { UserController } from './user.contoller';
// import {
//   createUserValidator,
//   updatePasswordValidator,
//   updateUserValidator,
//   userIdValidator,
// } from './user.validator';
import { validate } from '../middleware/validate.middleware';
// import { UserService } from './user.service';
import { requireRole } from '../middleware/require-role.middleware';
import { Role } from '../constants/roles.enum';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';

const propertiesRouter = Router();
const propertiesService = new PropertiesService();

const propertiesController = new PropertiesController(propertiesService);

propertiesRouter.post(
  '/',
  // createUserValidator,
  validate,
  requireRole(Role.ADMIN, Role.CORREDOR),
  propertiesController.create,
);
export default propertiesRouter;
