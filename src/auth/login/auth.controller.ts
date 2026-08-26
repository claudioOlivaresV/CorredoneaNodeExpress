import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './auth.dto';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body as LoginDto;

    const result = await this.authService.login({
      email,
      password,
    });

    return res.status(200).json(result);
  };
}
