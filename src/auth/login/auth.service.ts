import bcrypt from 'bcryptjs';
import { LoginDto } from './auth.dto';
import { prisma } from '../../config/prismaConfig';
import { UnauthorizedError } from '../../errors/app.errors';
import { JwtService } from '../../services/jwt.service';
import { LoginResponse } from './auth.types';

const DUMMY_PASSWORD_HASH = '$2b$10$...';

export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(dto: LoginDto): Promise<LoginResponse> {
    const user = await prisma.users.findUnique({
      where: {
        email: dto.email,
      },
      include: {
        role: true,
      },
    });

    const passwordHash = user?.password ?? DUMMY_PASSWORD_HASH;

    const isValidPassword = await bcrypt.compare(dto.password, passwordHash);

    if (!user || !user.active || !isValidPassword) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const token = this.jwtService.generateToken({
      sub: user.id,
      role: user.role.name,
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
