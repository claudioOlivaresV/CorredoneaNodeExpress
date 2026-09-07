import { Router } from 'express';

import { validate } from '../middleware/validate.middleware';
import { requireRole } from '../middleware/require-role.middleware';
import { Role } from '../constants/roles.enum';
import {
  rentalContractCreateValidator,
  rentalContractIdValidator,
} from './contract.validators';
import { ContractsService } from './contract.service';
import { ContractController } from './contract.controller';

const rentalContractsRouter = Router();

const contractService = new ContractsService();

const contractController = new ContractController(contractService);

rentalContractsRouter.post(
  '/',
  rentalContractCreateValidator,
  validate,
  requireRole(Role.ADMIN, Role.CORREDOR),
  contractController.create,
);

rentalContractsRouter.get(
  '/:id',
  rentalContractIdValidator,
  validate,
  requireRole(Role.ADMIN, Role.CORREDOR),
  contractController.getById,
);

rentalContractsRouter.patch(
  '/:id/cancel',
  rentalContractIdValidator,
  validate,
  requireRole(Role.ADMIN, Role.CORREDOR),
  contractController.cancel,
);

export default rentalContractsRouter;
