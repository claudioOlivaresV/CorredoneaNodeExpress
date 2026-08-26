import bcrypt from 'bcryptjs';
import { LoginDto } from './auth.dto';
import { prisma } from '../../config/prismaConfig';
import { UnauthorizedError } from '../../errors/app.errors';
import { JwtService } from '../../services/jwt.service';

export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(dto: LoginDto) {
    const user = await prisma.users.findUnique({
      where: {
        email: dto.email,
      },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('Credenciales inválidas');
    }
    if (!user.active) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const isValidPassword = await bcrypt.compare(dto.password, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const token = this.jwtService.generateToken({
      sub: user.id,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
      },
    };
  }
}
