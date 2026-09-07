import { Request, Response } from 'express';
import { ContractsService } from './contract.service';
import { CreateRentalContractDto } from './contract.types';

export class ContractController {
  constructor(private readonly contractService: ContractsService) {}

  create = async (req: Request, res: Response) => {
    const { property_id, tenant_id, start_date, end_date, monthly_rent } =
      req.body as CreateRentalContractDto;

    const result = await this.contractService.create({
      property_id,
      tenant_id,
      start_date,
      end_date,
      monthly_rent,
    });

    return res.status(200).json(result);
  };
}
