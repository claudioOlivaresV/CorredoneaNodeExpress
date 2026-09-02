import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import bcrypt from 'bcryptjs';

import { UserService } from '../../user/user.service';
import { prisma } from '../../config/prismaConfig';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../errors/app.errors';
import { Role } from '../../constants/roles.enum';
import {
  CreateUserDto,
  UpdatePasswordDto,
  UpdateUserDto,
} from '../../user/user.types';

jest.mock('../../config/prismaConfig', () => ({
  prisma: {
    users: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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

  // ---------------------------------------------------------
  // CREATE
  // ---------------------------------------------------------

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

  // ---------------------------------------------------------
  // DEACTIVATE
  // ---------------------------------------------------------

  it('debería rechazar si el usuario no existe al desactivar', async () => {
    jest.mocked(prisma.users.findUnique).mockResolvedValue(null);

    await expect(service.deactivate(1)).rejects.toThrow(
      new NotFoundError('Usuario no encontrado'),
    );

    expect(prisma.users.update).not.toHaveBeenCalled();
  });

  it('debería rechazar si el usuario ya está desactivado', async () => {
    jest.mocked(prisma.users.findUnique).mockResolvedValue({
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@test.com',
      password: 'hash',
      role_id: 2,
      active: false,
      created_at: new Date(),
    });

    await expect(service.deactivate(1)).rejects.toThrow(
      new BadRequestError('El usuario ya está desactivado'),
    );

    expect(prisma.users.update).not.toHaveBeenCalled();
  });

  it('debería rechazar si el usuario es administrador', async () => {
    jest.mocked(prisma.users.findUnique).mockResolvedValue({
      id: 1,
      name: 'Administrador',
      email: 'admin@test.com',
      password: 'hash',
      role_id: 1,
      active: true,
      created_at: new Date(),
    });

    expect(prisma.users.update).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------
  // ACTIVATE
  // ---------------------------------------------------------

  it('debería rechazar si el usuario no existe al activar', async () => {
    jest.mocked(prisma.users.findUnique).mockResolvedValue(null);

    await expect(service.activate(1)).rejects.toThrow(
      new NotFoundError('Usuario no encontrado'),
    );

    expect(prisma.users.update).not.toHaveBeenCalled();
  });

  it('debería rechazar si el usuario ya está activo', async () => {
    jest.mocked(prisma.users.findUnique).mockResolvedValue({
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@test.com',
      password: 'hash',
      role_id: 2,
      active: true,
      created_at: new Date(),
    });

    await expect(service.activate(1)).rejects.toThrow(
      new BadRequestError('El usuario ya está activado'),
    );

    expect(prisma.users.update).not.toHaveBeenCalled();
  });

  it('debería activar un usuario correctamente', async () => {
    const createdAt = new Date();

    jest.mocked(prisma.users.findUnique).mockResolvedValue({
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@test.com',
      password: 'hash',
      role_id: 2,
      active: false,
      created_at: createdAt,
    });

    jest.mocked(prisma.users.update).mockResolvedValue({
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@test.com',
      password: 'hash',
      role_id: 2,
      active: true,
      created_at: createdAt,
    });

    const result = await service.activate(1);

    expect(result).toEqual({
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@test.com',
      role_id: 2,
      active: true,
      created_at: createdAt,
    });

    expect(prisma.users.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { active: true },
    });
  });

  // ---------------------------------------------------------
  // GET ALL
  // ---------------------------------------------------------
  it('debería obtener los usuarios sin ADMIN', async () => {
    const users = [
      {
        id: 2,
        name: 'Juan',
        email: 'juan@test.com',
        role_id: 2,
        active: true,
        created_at: new Date(),
        role: {
          name: Role.CORREDOR,
        },
      },
    ];

    jest.mocked(prisma.users.findMany).mockResolvedValue(users as any);

    const result = await service.getAll();

    expect(prisma.users.findMany).toHaveBeenCalled();

    expect(result).toEqual([
      {
        id: 2,
        name: 'Juan',
        email: 'juan@test.com',
        role: Role.CORREDOR,
        active: true,
        created_at: users[0].created_at,
      },
    ]);
  });
  // ---------------------------------------------------------
  // UPDATE
  // ---------------------------------------------------------

  it('debería rechazar si el usuario no existe al actualizar', async () => {
    jest.mocked(prisma.users.findUnique).mockResolvedValue(null);

    const dto: UpdateUserDto = {
      name: 'Nuevo nombre',
    };

    await expect(service.update(1, dto)).rejects.toThrow(
      new NotFoundError('Usuario no encontrado'),
    );

    expect(prisma.users.update).not.toHaveBeenCalled();
  });

  it('debería rechazar si se intenta modificar un administrador', async () => {
    jest.mocked(prisma.users.findUnique).mockResolvedValue({
      id: 1,
      name: 'Administrador',
      email: 'admin@test.com',
      password: 'hash',
      role_id: 1,
      active: true,
      created_at: new Date(),
      role: {
        id: 1,
        name: Role.ADMIN,
        description: 'Administrador',
        active: true,
      },
    } as any);

    const dto: UpdateUserDto = {
      name: 'Nuevo nombre',
    };

    await expect(service.update(1, dto)).rejects.toThrow(
      new ForbiddenError('El administrador no puede ser modificado'),
    );

    expect(prisma.users.update).not.toHaveBeenCalled();
  });

  it('debería rechazar si el nuevo rol no existe', async () => {
    jest.mocked(prisma.users.findUnique).mockResolvedValue({
      id: 1,
      name: 'Juan',
      email: 'juan@test.com',
      password: 'hash',
      role_id: 2,
      active: true,
      created_at: new Date(),
      role: {
        id: 2,
        name: Role.CORREDOR,
        description: 'Corredor',
        active: true,
      },
    } as any);

    jest.mocked(prisma.roles.findUnique).mockResolvedValue(null);

    const dto: UpdateUserDto = {
      role_id: 99,
    };

    await expect(service.update(1, dto)).rejects.toThrow(
      new BadRequestError('El rol no es válido'),
    );

    expect(prisma.users.update).not.toHaveBeenCalled();
  });

  it('debería rechazar si el nuevo rol está inactivo', async () => {
    jest.mocked(prisma.users.findUnique).mockResolvedValue({
      id: 1,
      name: 'Juan',
      email: 'juan@test.com',
      password: 'hash',
      role_id: 2,
      active: true,
      created_at: new Date(),
      role: {
        id: 2,
        name: Role.CORREDOR,
        description: 'Corredor',
        active: true,
      },
    } as any);

    jest.mocked(prisma.roles.findUnique).mockResolvedValue({
      id: 3,
      name: Role.ARRENDADOR,
      description: 'Arrendador',
      active: false,
    });

    const dto: UpdateUserDto = {
      role_id: 3,
    };

    await expect(service.update(1, dto)).rejects.toThrow(
      new BadRequestError('El rol no es válido'),
    );

    expect(prisma.users.update).not.toHaveBeenCalled();
  });

  it('debería rechazar si se intenta asignar el rol ADMIN', async () => {
    jest.mocked(prisma.users.findUnique).mockResolvedValue({
      id: 1,
      name: 'Juan',
      email: 'juan@test.com',
      password: 'hash',
      role_id: 2,
      active: true,
      created_at: new Date(),
      role: {
        id: 2,
        name: Role.CORREDOR,
        description: 'Corredor',
        active: true,
      },
    } as any);

    jest.mocked(prisma.roles.findUnique).mockResolvedValue({
      id: 1,
      name: Role.ADMIN,
      description: 'Administrador',
      active: true,
    });

    const dto: UpdateUserDto = {
      role_id: 1,
    };

    await expect(service.update(1, dto)).rejects.toThrow(
      new ForbiddenError('No se puede asignar el rol ADMIN'),
    );

    expect(prisma.users.update).not.toHaveBeenCalled();
  });

  it('debería rechazar si el nuevo email ya existe', async () => {
    jest
      .mocked(prisma.users.findUnique)
      .mockResolvedValueOnce({
        id: 1,
        name: 'Juan',
        email: 'juan@test.com',
        password: 'hash',
        role_id: 2,
        active: true,
        created_at: new Date(),
        role: {
          id: 2,
          name: Role.CORREDOR,
          description: 'Corredor',
          active: true,
        },
      } as any)
      .mockResolvedValueOnce({
        id: 2,
        name: 'Pedro',
        email: 'pedro@test.com',
        password: 'hash',
        role_id: 2,
        active: true,
        created_at: new Date(),
        role: {
          id: 2,
          name: Role.CORREDOR,
          description: 'Corredor',
          active: true,
        },
      } as any);

    const dto: UpdateUserDto = {
      email: 'pedro@test.com',
    };

    await expect(service.update(1, dto)).rejects.toThrow(
      new ConflictError('El email ya está registrado'),
    );

    expect(prisma.users.update).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------
  // UPDATE PASSWORD
  // ---------------------------------------------------------

  it('debería rechazar si el usuario no existe al cambiar contraseña', async () => {
    jest.mocked(prisma.users.findUnique).mockResolvedValue(null);

    const dto: UpdatePasswordDto = {
      password: 'NuevaPassword123',
    };

    expect(prisma.users.update).not.toHaveBeenCalled();
  });

  it('debería rechazar si un usuario intenta cambiar la contraseña de otro', async () => {
    jest.mocked(prisma.users.findUnique).mockResolvedValue({
      id: 2,
      name: 'Pedro',
      email: 'pedro@test.com',
      password: 'hash',
      role_id: 2,
      active: true,
      created_at: new Date(),
    });

    const dto: UpdatePasswordDto = {
      password: 'NuevaPassword123',
    };

    await expect(
      service.updatePassword(2, dto, 1, Role.CORREDOR),
    ).rejects.toThrow(
      new ForbiddenError('No puedes cambiar la contraseña de otro usuario'),
    );

    expect(prisma.users.update).not.toHaveBeenCalled();
  });

  it('debería permitir al usuario cambiar su propia contraseña', async () => {
    const dto: UpdatePasswordDto = {
      password: 'NuevaPassword123',
    };

    jest.mocked(prisma.users.findUnique).mockResolvedValue({
      id: 1,
      name: 'Juan',
      email: 'juan@test.com',
      password: 'hash',
      role_id: 2,
      active: true,
      created_at: new Date(),
    });

    jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'new-password');

    jest.mocked(prisma.users.update).mockResolvedValue({
      id: 1,
      name: 'Juan',
      email: 'juan@test.com',
      password: 'new-password',
      role_id: 2,
      active: true,
      created_at: new Date(),
    });

    const result = await service.updatePassword(1, dto, 1, Role.CORREDOR);

    expect(result).toEqual({
      message: 'Contraseña actualizada correctamente',
    });

    expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);

    expect(prisma.users.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        password: 'new-password',
      },
      include: {
        role: true,
      },
    });
  });
});
