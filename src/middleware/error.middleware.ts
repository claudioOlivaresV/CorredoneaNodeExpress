import { Request, Response, NextFunction } from 'express';

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  return res.status(err.statusCode || 500).json({
    message: err.message || 'Error interno del servidor',
  });
};
