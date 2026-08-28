import { Request, Response } from 'express';
import { CreateUserDto, UpdatePasswordDto, UpdateUserDto } from './user.types';
import { UserService } from './user.service';

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
    const { email } = req.body as UpdateUserDto;

    // const result = await this.authService.login({
    //   email,
    //   password,
    // });

    return res.status(200).json('update');
  };
  updatePassword = async (req: Request, res: Response) => {
    const { password } = req.body as UpdatePasswordDto;

    return res.status(200).json('updatePassword');
  };

  deactivate = async (req: Request, res: Response) => {
    return res.status(200).json('deactivate');
  };

  activate = async (req: Request, res: Response) => {
    return res.status(200).json('activate');
  };
}
