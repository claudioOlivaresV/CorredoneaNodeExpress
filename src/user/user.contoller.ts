import { Request, Response } from 'express';
import { CreateUserDto, UpdatePasswordDto, UpdateUserDto } from './user.types';
import { UserService } from './user.service';
import { Role } from '../constants/roles.enum';

export class UserController {
  constructor(private readonly userService: UserService) {}

  create = async (req: Request, res: Response) => {
    const { email, password, role_id, name } = req.body as CreateUserDto;

    const result = await this.userService.create({
      email,
      password,
      role_id,
      name,
    });

    return res.status(201).json(result);
  };

  update = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const dto = req.body as UpdateUserDto;

    const result = await this.userService.update(id, dto);

    return res.status(200).json(result);
  };
  updatePassword = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const dto = req.body as UpdatePasswordDto;

    const result = await this.userService.updatePassword(
      id,
      dto,
      Number(req.user!.sub),
      req.user!.role as Role,
    );

    return res.status(200).json(result);
  };

  deactivate = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const result = await this.userService.deactivate(id);

    return res.status(200).json(result);
  };

  activate = async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const result = await this.userService.activate(id);

    return res.status(200).json(result);
  };
  getAll = async (req: Request, res: Response) => {
    const result = await this.userService.getAll();

    return res.status(200).json(result);
  };
}
