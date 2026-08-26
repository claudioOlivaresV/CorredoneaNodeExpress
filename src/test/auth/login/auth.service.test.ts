import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import bcrypt from 'bcryptjs';

import { AuthService } from '../../../auth/login/auth.service';
import { prisma } from '../../../config/prismaConfig';

jest.mock('../../../config/prismaConfig', () => ({
  prisma: {
    users: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: any;

  beforeEach(() => {
    jwtService = {
      generateToken: jest.fn(),
    };

    service = new AuthService(jwtService);

    jest.clearAllMocks();
  });

  it('debería realizar login correctamente', async () => {
    (prisma.users.findUnique as any).mockResolvedValue({
      id: 1,
      name: 'Juan',
      email: 'test@test.com',
      password: 'password-hash',
      active: true,
      role: {
        name: 'USER',
      },
    });

    (bcrypt.compare as any).mockResolvedValue(true);

    jwtService.generateToken.mockReturnValue('token-123');

    const result = await service.login({
      email: 'test@test.com',
      password: '123456',
    });

    expect(result).toEqual({
      token: 'token-123',
      user: {
        id: 1,
        name: 'Juan',
        email: 'test@test.com',
        role: 'USER',
      },
    });

    expect(jwtService.generateToken).toHaveBeenCalledWith({
      sub: 1,
    });
  });
  it('debería rechazar si el usuario no existe', async () => {
    (prisma.users.findUnique as any).mockResolvedValue(null);

    await expect(
      service.login({
        email: 'test@test.com',
        password: '123456',
      }),
    ).rejects.toThrow('Credenciales inválidas');
  });

  it('debería rechazar si el usuario está inactivo', async () => {
    (prisma.users.findUnique as any).mockResolvedValue({
      id: 1,
      name: 'Juan',
      email: 'test@test.com',
      password: 'password-hash',
      active: false,
      role: {
        name: 'USER',
      },
    });

    await expect(
      service.login({
        email: 'test@test.com',
        password: '123456',
      }),
    ).rejects.toThrow('Credenciales inválidas');
  });

  it('debería rechazar si la contraseña es incorrecta', async () => {
    (prisma.users.findUnique as any).mockResolvedValue({
      id: 1,
      name: 'Juan',
      email: 'test@test.com',
      password: 'password-hash',
      active: true,
      role: {
        name: 'USER',
      },
    });

    (bcrypt.compare as any).mockResolvedValue(false);

    await expect(
      service.login({
        email: 'test@test.com',
        password: '123456',
      }),
    ).rejects.toThrow('Credenciales inválidas');
  });
});
