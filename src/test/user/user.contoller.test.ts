import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';

import { UserController } from '../../user/user.contoller';
import { UserService } from '../../user/user.service';
import { CreateUserDto, UserResponseDto } from '../../user/user.types';

describe('UserController', () => {
  let controller: UserController;
  let createMock: jest.Mock<(dto: CreateUserDto) => Promise<UserResponseDto>>;

  let req: Request;
  let res: Response;

  beforeEach(() => {
    createMock = jest.fn();

    const userService = {
      create: createMock,
    };

    controller = new UserController(userService as UserService);

    req = {
      body: {
        name: 'Juan Pérez',
        email: 'juan@test.com',
        password: '12345678',
        role_id: 2,
      },
    } as Request;

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;

    jest.clearAllMocks();
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

    createMock.mockResolvedValue(result);

    await controller.create(req, res);

    expect(createMock).toHaveBeenCalledTimes(1);

    expect(createMock).toHaveBeenCalledWith(dto);

    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith(result);
  });
});
