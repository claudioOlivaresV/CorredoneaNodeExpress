import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { requireRole } from '../middleware/require-role.middleware';
import { Role } from '../constants/roles.enum';
import { paymentIdValidator } from './payments.validator';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

const paymentsRouter = Router();

const paymentsService = new PaymentsService();
const paymentsController = new PaymentsController(paymentsService);

paymentsRouter.patch(
  '/:id/pay',
  paymentIdValidator,
  validate,
  requireRole(Role.ADMIN, Role.CORREDOR, Role.ARRENDATARIO),
  paymentsController.pay,
);

export default paymentsRouter;
