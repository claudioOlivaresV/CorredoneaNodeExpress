import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';

import { errorMiddleware } from '../../middleware/error.middleware';
import { AppError } from '../../errors/app.errors';

describe('errorMiddleware', () => {
  let res: {
    status: jest.Mock;
    json: jest.Mock;
  };

  beforeEach(() => {
    res = {
      status: jest.fn(),
      json: jest.fn(),
    };

    res.status.mockReturnValue(res);
  });

  it('debería responder con el status y mensaje del AppError', () => {
    const err = new AppError(400, 'Error de prueba');

    errorMiddleware(err, {} as Request, res as unknown as Response, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      message: 'Error de prueba',
    });
  });

  it('debería responder 500 si no es un AppError', () => {
    const err = new Error('Error cualquiera');

    errorMiddleware(err, {} as Request, res as unknown as Response, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      message: 'Error interno del servidor',
    });
  });
});
