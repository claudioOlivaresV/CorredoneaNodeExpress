import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { describe, expect, it, jest, beforeEach } from '@jest/globals';

import { validate } from '../../middleware/validate.middleware';

jest.mock('express-validator', () => ({
  validationResult: jest.fn(),
}));

const mockedValidationResult = validationResult as unknown as jest.Mock;

describe('validate middleware', () => {
  let req: Partial<Request>;
  let res: {
    status: jest.Mock;
    json: jest.Mock;
  };
  let next: NextFunction;

  beforeEach(() => {
    req = {};

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    next = jest.fn();

    jest.clearAllMocks();
  });

  it('debería llamar next() cuando no existen errores de validación', () => {
    mockedValidationResult.mockReturnValue({
      isEmpty: () => true,
      array: () => [],
    });

    validate(req as Request, res as unknown as Response, next);

    expect(next).toHaveBeenCalledTimes(1);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('debería responder 400 cuando existen errores de validación', () => {
    const errors = [
      {
        type: 'field',
        value: '',
        msg: 'El email es obligatorio',
        path: 'email',
        location: 'body',
      },
    ];

    mockedValidationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => errors,
    });

    validate(req as Request, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      errors: ['El email es obligatorio'],
    });

    expect(next).not.toHaveBeenCalled();
  });
});
