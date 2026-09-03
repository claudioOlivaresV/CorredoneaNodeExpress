import { Request, Response } from 'express';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto, UpdatePropertyDto } from './properties.types';

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
  getAll = async (req: Request, res: Response) => {
    const { status, min_price, max_price, agent_id, owner_id } = req.query;

    const result = await this.propertiesService.getAll({
      status: status as string | undefined,
      min_price: min_price !== undefined ? Number(min_price) : undefined,
      max_price: max_price !== undefined ? Number(max_price) : undefined,
      agent_id: agent_id !== undefined ? Number(agent_id) : undefined,
      owner_id: owner_id !== undefined ? Number(owner_id) : undefined,
    });

    return res.status(200).json(result);
  };
  getById = async (req: Request, res: Response) => {
    const id = req.params.id as unknown as number;

    const property = await this.propertiesService.getById(id);

    return res.status(200).json(property);
  };
  update = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const dto = req.body as UpdatePropertyDto;

    const result = await this.propertiesService.update(id, dto);

    return res.status(200).json(result);
  };
}
