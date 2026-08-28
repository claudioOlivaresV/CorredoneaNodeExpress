import bcrypt from 'bcryptjs';

// import { JwtService } from '../../services/jwt.service';
import { CreateUserDto, UserResponseDto } from './user.types';
import { prisma } from '../config/prismaConfig';
import { BadRequestError, ConflictError } from '../errors/app.errors';
import { Role } from '../constants/roles.enum';

export class UserService {
  constructor() {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await prisma.users.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existingUser) {
      throw new ConflictError('El email ya está registrado');
    }

    const role = await prisma.roles.findUnique({
      where: {
        id: dto.role_id,
      },
    });

    if (!role || !role.active) {
      throw new BadRequestError('El rol no es válido');
    }
    if (role.name === Role.ADMIN) {
      const existingAdmin = await prisma.users.findFirst({
        where: {
          role: {
            name: Role.ADMIN,
          },
        },
      });

      if (existingAdmin) {
        throw new ConflictError('Ya existe un administrador');
      }
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await prisma.users.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: passwordHash,
        role_id: dto.role_id,
      },
    });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role_id: user.role_id,
      active: user.active,
      created_at: user.created_at,
    };
  }
}
