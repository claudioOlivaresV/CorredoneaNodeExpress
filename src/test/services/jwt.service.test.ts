import {
  describe,
  expect,
  it,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals';
import jwt from 'jsonwebtoken';
import { JwtService } from '../../services/jwt.service';
import { UnauthorizedError } from '../../errors/app.errors';

jest.mock('jsonwebtoken');

describe('JwtService', () => {
  const jwtService = new JwtService();

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  it('debería generar un token correctamente', () => {
    const payload = {
      sub: 1,
    };

    const signMock = jwt.sign as jest.Mock;
    signMock.mockReturnValue('fake-jwt-token');

    const result = jwtService.generateToken(payload);

    expect(result).toBe('fake-jwt-token');

    expect(signMock).toHaveBeenCalledWith(payload, 'test-secret', {
      expiresIn: '1h',
    });
  });

  it('debería lanzar un error si JWT_SECRET no está configurado', () => {
    delete process.env.JWT_SECRET;

    expect(() => {
      jwtService.generateToken({
        sub: 1,
      });
    }).toThrow('JWT_SECRET no configurado');

    expect(jwt.sign).not.toHaveBeenCalled();
  });

  it('debería lanzar UnauthorizedError si falla la generación del token', () => {
    const signMock = jest.mocked(jwt.sign);

    signMock.mockImplementation(() => {
      throw new Error('Error generando JWT');
    });

    expect(() => {
      jwtService.generateToken({
        sub: 1,
      });
    }).toThrow(UnauthorizedError);

    expect(() => {
      jwtService.generateToken({
        sub: 1,
      });
    }).toThrow('No se pudo generar el token');
  });
});
