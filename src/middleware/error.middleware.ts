import { Request, Response } from 'express';
interface AppError {
  statusCode?: number;
  message?: string;
}
export const errorMiddleware = (err: AppError, req: Request, res: Response) => {
  return res.status(err.statusCode || 500).json({
    message: err.message || 'Error interno del servidor',
  });
};
