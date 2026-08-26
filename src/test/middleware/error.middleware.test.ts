import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';

import { errorMiddleware } from '../../middleware/error.middleware';

describe('errorMiddleware', () => {
  let res: any;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('debería responder con el status y mensaje del error', () => {
    const err = {
      statusCode: 400,
      message: 'Error de prueba',
    };

    errorMiddleware(
      err,
      {} as Request,
      res as Response,
      jest.fn() as NextFunction,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error de prueba',
    });
  });

  it('debería responder 500 con mensaje por defecto', () => {
    const err = {};

    errorMiddleware(
      err,
      {} as Request,
      res as Response,
      jest.fn() as NextFunction,
    );

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Error interno del servidor',
    });
  });
});
