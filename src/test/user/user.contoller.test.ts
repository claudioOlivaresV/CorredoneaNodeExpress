import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Request, Response } from 'express';

import { UserController } from '../../user/user.contoller';
import { UserService } from '../../user/user.service';
import {
  CreateUserDto,
  UpdatePasswordDto,
  UpdateUserDto,
  UserResponseDto,
} from '../../user/user.types';
import { Role } from '../../constants/roles.enum';

describe('UserController', () => {
  let controller: UserController;

  const createMock =
    jest.fn<(dto: CreateUserDto) => Promise<UserResponseDto>>();

  const updateMock =
    jest.fn<(id: number, dto: UpdateUserDto) => Promise<UserResponseDto>>();

  const updatePasswordMock =
    jest.fn<
      (
        id: number,
        dto: UpdatePasswordDto,
        requesterId: number,
        requesterRole: Role,
      ) => Promise<{ message: string }>
    >();

  const deactivateMock = jest.fn<(id: number) => Promise<UserResponseDto>>();

  const activateMock = jest.fn<(id: number) => Promise<UserResponseDto>>();

  const getAllMock = jest.fn<() => Promise<UserResponseDto[]>>();

  const userService = {
    create: createMock,
    update: updateMock,
    updatePassword: updatePasswordMock,
    deactivate: deactivateMock,
    activate: activateMock,
    getAll: getAllMock,
  } as UserService;

  let req: Request;
  let res: Response;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {},
      params: {},
      user: {
        sub: '1',
        role: Role.ADMIN,
      },
    } as unknown as Request;

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;

    controller = new UserController(userService);
  });

  it('debería crear un usuario correctamente', async () => {
    const dto: CreateUserDto = {
      name: 'Juan Pérez',
      email: 'juan@test.com',
      password: '12345678',
      role_id: 2,
    };

    const result: UserResponseDto = {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@test.com',
      role_id: 2,
      active: true,
      created_at: new Date(),
    };

    req.body = dto;

    createMock.mockResolvedValue(result);

    await controller.create(req, res);

    expect(createMock).toHaveBeenCalledWith(dto);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(result);
  });

  it('debería actualizar un usuario correctamente', async () => {
    const dto: UpdateUserDto = {
      name: 'Juan Actualizado',
    };

    const result = {
      id: 1,
      name: 'Juan Actualizado',
    } as UserResponseDto;

    req.params = { id: '1' };
    req.body = dto;

    updateMock.mockResolvedValue(result);

    await controller.update(req, res);

    expect(updateMock).toHaveBeenCalledWith(1, dto);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(result);
  });

  it('debería actualizar la contraseña correctamente', async () => {
    const dto: UpdatePasswordDto = {
      password: 'NuevaPassword123',
    };

    const result = {
      message: 'Contraseña actualizada correctamente',
    };

    req.params = { id: '1' };
    req.body = dto;

    updatePasswordMock.mockResolvedValue(result);

    await controller.updatePassword(req, res);

    expect(updatePasswordMock).toHaveBeenCalledWith(1, dto, 1, Role.ADMIN);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(result);
  });

  it('debería desactivar un usuario correctamente', async () => {
    const result = {
      id: 1,
      name: 'Juan Pérez',
      active: false,
    } as UserResponseDto;

    req.params = { id: '1' };

    deactivateMock.mockResolvedValue(result);

    await controller.deactivate(req, res);

    expect(deactivateMock).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(result);
  });

  it('debería activar un usuario correctamente', async () => {
    const result = {
      id: 1,
      name: 'Juan Pérez',
      active: true,
    } as UserResponseDto;

    req.params = { id: '1' };

    activateMock.mockResolvedValue(result);

    await controller.activate(req, res);

    expect(activateMock).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(result);
  });

  it('debería obtener todos los usuarios', async () => {
    const result = [
      {
        id: 1,
        name: 'Juan Pérez',
        active: true,
      } as UserResponseDto,
    ];

    getAllMock.mockResolvedValue(result);

    await controller.getAll(req, res);

    expect(getAllMock).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(result);
  });
});
