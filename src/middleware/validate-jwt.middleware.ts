import { NextFunction, Request, Response } from 'express';

import jwt, { JwtPayload } from 'jsonwebtoken';

import { UnauthorizedError } from '../errors/app.errors';

export const validateJWT = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return next(new UnauthorizedError('Token no proporcionado'));
  }

  const [type, token] = authorization.split(' ');

  if (type !== 'Bearer' || !token) {
    return next(new UnauthorizedError('Token inválido'));
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return next(new Error('JWT_SECRET no configurado'));
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;

    req.user = payload;

    next();
  } catch {
    return next(new UnauthorizedError('Token inválido o expirado'));
  }
};
