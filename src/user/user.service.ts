import bcrypt from 'bcryptjs';

// import { JwtService } from '../../services/jwt.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './user.types';
import { prisma } from '../config/prismaConfig';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../errors/app.errors';
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
  async deactivate(id: number): Promise<UserResponseDto> {
    const user = await prisma.users.findUnique({
      where: {
        id,
      },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    if (!user.active) {
      throw new BadRequestError('El usuario ya está desactivado');
    }
    if (user.role.name === Role.ADMIN) {
      throw new ForbiddenError('El administrador no puede ser desactivado');
    }

    const updatedUser = await prisma.users.update({
      where: {
        id,
      },
      data: {
        active: false,
      },
    });

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role_id: updatedUser.role_id,
      active: updatedUser.active,
      created_at: updatedUser.created_at,
    };
  }
  async activate(id: number): Promise<UserResponseDto> {
    const user = await prisma.users.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    if (user.active) {
      throw new BadRequestError('El usuario ya está activado');
    }

    const updatedUser = await prisma.users.update({
      where: {
        id,
      },
      data: {
        active: true,
      },
    });

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role_id: updatedUser.role_id,
      active: updatedUser.active,
      created_at: updatedUser.created_at,
    };
  }
  async getAll(): Promise<UserResponseDto[]> {
    const users = await prisma.users.findMany({
      where: {
        role: {
          name: {
            not: Role.ADMIN,
          },
        },
      },
      include: {
        role: true,
      },
      orderBy: [
        {
          active: 'desc',
        },
        {
          name: 'asc',
        },
      ],
    });

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      active: user.active,
      created_at: user.created_at,
    }));
  }

  async update(id: number, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await prisma.users.findUnique({
      where: {
        id,
      },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    if (user.role.name === Role.ADMIN) {
      throw new ForbiddenError('El administrador no puede ser modificado');
    }

    if (dto.role_id !== undefined) {
      const role = await prisma.roles.findUnique({
        where: {
          id: dto.role_id,
        },
      });

      if (!role || !role.active) {
        throw new BadRequestError('El rol no es válido');
      }

      if (role.name === Role.ADMIN) {
        throw new ForbiddenError('No se puede asignar el rol ADMIN');
      }
    }
    if (dto.email !== undefined && dto.email !== user.email) {
      const existingUser = await prisma.users.findUnique({
        where: {
          email: dto.email,
        },
      });

      if (existingUser) {
        throw new ConflictError('El email ya está registrado');
      }
    }

    const updatedUser = await prisma.users.update({
      where: {
        id,
      },
      data: {
        ...(dto.name !== undefined && {
          name: dto.name,
        }),

        ...(dto.email !== undefined && {
          email: dto.email,
        }),

        ...(dto.role_id !== undefined && {
          role_id: dto.role_id,
        }),
      },
      include: {
        role: true,
      },
    });

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role.name,
      active: updatedUser.active,
      created_at: updatedUser.created_at,
    };
  }
}
