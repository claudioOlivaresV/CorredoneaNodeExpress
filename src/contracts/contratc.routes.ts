import { Router } from 'express';

import { validate } from '../middleware/validate.middleware';
import { requireRole } from '../middleware/require-role.middleware';
import { Role } from '../constants/roles.enum';
import { rentalContractCreateValidator } from './contract.validators';
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
  '/',
  validate,
  requireRole(Role.ADMIN, Role.CORREDOR),
  //   rentalContractsController.getAll,
);

rentalContractsRouter.get(
  '/:id',
  //   rentalContractIdValidator,
  validate,
  //   rentalContractsController.getById,
);

rentalContractsRouter.patch(
  '/:id/deactivate',
  //   rentalContractIdValidator,
  validate,
  requireRole(Role.ADMIN, Role.CORREDOR),
  //   rentalContractsController.deactivate,
);

export default rentalContractsRouter;
