import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/app.errors';

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  return res.status(500).json({
    message: 'Error interno del servidor',
  });
};
