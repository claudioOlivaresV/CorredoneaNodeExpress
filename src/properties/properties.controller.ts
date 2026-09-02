import { Request, Response } from 'express';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './properties.types';

export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  create = async (req: Request, res: Response) => {
    const { address, description, monthly_rent, owner_id, agent_id } =
      req.body as CreatePropertyDto;

    const result = await this.propertiesService.create({
      address,
      description,
      monthly_rent,
      owner_id,
      agent_id,
    });

    return res.status(200).json(result);
  };
}
