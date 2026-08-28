import { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors/app.errors';
import { Role } from '../constants/roles.enum';
export const requireRole = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError('No autenticado'));
    }

    if (!roles.includes(req.user.role as Role)) {
      return next(new ForbiddenError('No tienes permisos'));
    }

    next();
  };
};
