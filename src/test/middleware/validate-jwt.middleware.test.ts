import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { UnauthorizedError } from '../../errors/app.errors';
import { validateJWT } from '../../middleware/validate-jwt.middleware';

describe('validateJWT', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
    } as Request;

    res = {} as Response;
    next = jest.fn();

    jest.clearAllMocks();

    process.env.JWT_SECRET = 'test-secret';
  });

  it('debería rechazar si no se proporciona token', () => {
    validateJWT(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('debería rechazar si el header Authorization es inválido', () => {
    req.headers.authorization = 'Basic token123';

    validateJWT(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('debería rechazar si JWT_SECRET no está configurado', () => {
    delete process.env.JWT_SECRET;

    req.headers.authorization = 'Bearer token123';

    validateJWT(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('debería rechazar si el token es inválido', () => {
    req.headers.authorization = 'Bearer token123';

    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('Token inválido');
    });

    validateJWT(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });
});
