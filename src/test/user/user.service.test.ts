import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import bcrypt from 'bcryptjs';

import { UserService } from '../../user/user.service';
import { prisma } from '../../config/prismaConfig';
import { BadRequestError, ConflictError } from '../../errors/app.errors';
import { Role } from '../../constants/roles.enum';
import { CreateUserDto } from '../../user/user.types';

jest.mock('../../config/prismaConfig', () => ({
  prisma: {
    users: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    roles: {
      findUnique: jest.fn(),
    },
  },
}));

describe('UserService', () => {
  let service: UserService;

  const dto: CreateUserDto = {
    name: 'Juan Pérez',
    email: 'juan@test.com',
    password: '12345678',
    role_id: 2,
  };

  beforeEach(() => {
    service = new UserService();

    jest.clearAllMocks();

    jest.restoreAllMocks();
  });

  it('debería rechazar si el email ya está registrado', async () => {
    jest.mocked(prisma.users.findUnique).mockResolvedValue({
      id: 1,
      name: 'Usuario existente',
      email: dto.email,
      password: 'hash',
      role_id: 2,
      active: true,
      created_at: new Date(),
    });

    await expect(service.create(dto)).rejects.toThrow(
      new ConflictError('El email ya está registrado'),
    );

    expect(prisma.roles.findUnique).not.toHaveBeenCalled();
    expect(prisma.users.create).not.toHaveBeenCalled();
  });

  it('debería rechazar si el rol no existe', async () => {
    jest.mocked(prisma.users.findUnique).mockResolvedValue(null);

    jest.mocked(prisma.roles.findUnique).mockResolvedValue(null);

    await expect(service.create(dto)).rejects.toThrow(
      new BadRequestError('El rol no es válido'),
    );

    expect(prisma.users.create).not.toHaveBeenCalled();
  });

  it('debería rechazar si el rol está inactivo', async () => {
    jest.mocked(prisma.users.findUnique).mockResolvedValue(null);

    jest.mocked(prisma.roles.findUnique).mockResolvedValue({
      id: 2,
      name: Role.CORREDOR,
      description: 'Corredor de propiedades',
      active: false,
    });

    await expect(service.create(dto)).rejects.toThrow(
      new BadRequestError('El rol no es válido'),
    );

    expect(prisma.users.create).not.toHaveBeenCalled();
  });

  it('debería rechazar si se intenta crear un segundo administrador', async () => {
    const adminDto: CreateUserDto = {
      ...dto,
      role_id: 1,
    };

    jest.mocked(prisma.users.findUnique).mockResolvedValue(null);

    jest.mocked(prisma.roles.findUnique).mockResolvedValue({
      id: 1,
      name: Role.ADMIN,
      description: 'Administrador del sistema',
      active: true,
    });

    jest.mocked(prisma.users.findFirst).mockResolvedValue({
      id: 1,
      name: 'Admin existente',
      email: 'admin@test.com',
      password: 'hash',
      role_id: 1,
      active: true,
      created_at: new Date(),
    });

    await expect(service.create(adminDto)).rejects.toThrow(
      new ConflictError('Ya existe un administrador'),
    );

    expect(prisma.users.create).not.toHaveBeenCalled();
  });

  it('debería crear un administrador si no existe otro', async () => {
    const adminDto: CreateUserDto = {
      ...dto,
      role_id: 1,
    };

    const createdAt = new Date();

    jest.mocked(prisma.users.findUnique).mockResolvedValue(null);

    jest.mocked(prisma.roles.findUnique).mockResolvedValue({
      id: 1,
      name: Role.ADMIN,
      description: 'Administrador del sistema',
      active: true,
    });

    jest.mocked(prisma.users.findFirst).mockResolvedValue(null);

    jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'password-hash');

    jest.mocked(prisma.users.create).mockResolvedValue({
      id: 10,
      name: adminDto.name,
      email: adminDto.email,
      password: 'password-hash',
      role_id: 1,
      active: true,
      created_at: createdAt,
    });

    const result = await service.create(adminDto);

    expect(result).toEqual({
      id: 10,
      name: adminDto.name,
      email: adminDto.email,
      role_id: 1,
      active: true,
      created_at: createdAt,
    });

    expect(bcrypt.hash).toHaveBeenCalledWith(adminDto.password, 10);

    expect(prisma.users.create).toHaveBeenCalledWith({
      data: {
        name: adminDto.name,
        email: adminDto.email,
        password: 'password-hash',
        role_id: 1,
      },
    });
  });

  it('debería crear un usuario con un rol normal', async () => {
    jest.mocked(prisma.users.findUnique).mockResolvedValue(null);

    jest.mocked(prisma.roles.findUnique).mockResolvedValue({
      id: 2,
      name: Role.CORREDOR,
      description: 'Corredor de propiedades',
      active: true,
    });

    jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'password-hash');

    const createdAt = new Date();

    jest.mocked(prisma.users.create).mockResolvedValue({
      id: 20,
      name: dto.name,
      email: dto.email,
      password: 'password-hash',
      role_id: dto.role_id,
      active: true,
      created_at: createdAt,
    });

    const result = await service.create(dto);

    expect(result).toEqual({
      id: 20,
      name: dto.name,
      email: dto.email,
      role_id: dto.role_id,
      active: true,
      created_at: createdAt,
    });

    expect(prisma.users.findFirst).not.toHaveBeenCalled();

    expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);

    expect(prisma.users.create).toHaveBeenCalledTimes(1);
  });
});
