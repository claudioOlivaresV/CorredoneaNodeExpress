import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';

import { requireRole } from '../../middleware/require-role.middleware';
import { ForbiddenError, UnauthorizedError } from '../../errors/app.errors';
import { Role } from '../../constants/roles.enum';

describe('requireRole', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = {} as Request;
    res = {} as Response;
    next = jest.fn();

    jest.clearAllMocks();
  });

  it('debería rechazar si no está autenticado', () => {
    requireRole(Role.ADMIN)(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedError));
  });

  it('debería rechazar si no tiene el rol requerido', () => {
    req.user = {
      id: 1,
      role: Role.CORREDOR,
    };

    requireRole(Role.ADMIN)(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ForbiddenError));
  });

  it('debería permitir si tiene el rol requerido', () => {
    req.user = {
      id: 1,
      role: Role.ADMIN,
    };

    requireRole(Role.ADMIN)(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });
});
