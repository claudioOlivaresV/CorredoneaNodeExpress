import { Request, Response } from 'express';
import { describe, expect, it, jest } from '@jest/globals';

import { AuthController } from '../../../auth/login/auth.controller';
import { AuthService } from '../../../auth/login/auth.service';
import { LoginResponse } from '../../../auth/login/auth.types';

describe('AuthController - login', () => {
  it('debería autenticar al usuario y devolver 200', async () => {
    const loginResult: LoginResponse = {
      token: 'fake-jwt-token',
      user: {
        id: 1,
        name: 'Claudio',
        email: 'claudio@test.com',
        role: 'ADMIN',
      },
    };

    const authService = {
      login: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    authService.login.mockResolvedValue(loginResult);

    const controller = new AuthController(authService);

    const req = {
      body: {
        email: 'claudio@test.com',
        password: 'Password123',
      },
    } as Request;

    const json = jest.fn();

    const res = {
      status: jest.fn().mockReturnValue({
        json,
      }),
    } as unknown as Response;

    await controller.login(req, res);

    expect(authService.login).toHaveBeenCalledTimes(1);

    expect(authService.login).toHaveBeenCalledWith({
      email: 'claudio@test.com',
      password: 'Password123',
    });

    expect(res.status).toHaveBeenCalledWith(200);

    expect(json).toHaveBeenCalledWith(loginResult);
  });

  it('debería propagar el error del AuthService', async () => {
    const error = new Error('Credenciales inválidas');

    const authService = {
      login: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    authService.login.mockRejectedValue(error);

    const controller = new AuthController(authService);

    const req = {
      body: {
        email: 'claudio@test.com',
        password: 'Password123',
      },
    } as Request;

    const res = {} as unknown as Response;

    await expect(controller.login(req, res)).rejects.toThrow(
      'Credenciales inválidas',
    );
  });
});
