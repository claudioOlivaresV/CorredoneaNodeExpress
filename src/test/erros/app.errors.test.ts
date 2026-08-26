import { describe, expect, it } from '@jest/globals';

import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from '../../errors/app.errors';

describe('AppError', () => {
  it('debería crear un error con statusCode y message', () => {
    const error = new AppError(418, 'Error personalizado');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);

    expect(error.statusCode).toBe(418);
    expect(error.message).toBe('Error personalizado');
    expect(error.name).toBe('AppError');
  });
});

describe('BadRequestError', () => {
  it('debería usar status 400 y mensaje por defecto', () => {
    const error = new BadRequestError();

    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Solicitud inválida');
    expect(error.name).toBe('BadRequestError');
  });

  it('debería permitir un mensaje personalizado', () => {
    const error = new BadRequestError('Datos inválidos');

    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Datos inválidos');
  });
});

describe('UnauthorizedError', () => {
  it('debería usar status 401 y mensaje por defecto', () => {
    const error = new UnauthorizedError();

    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('No autorizado');
    expect(error.name).toBe('UnauthorizedError');
  });

  it('debería permitir un mensaje personalizado', () => {
    const error = new UnauthorizedError('Credenciales inválidas');

    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('Credenciales inválidas');
  });
});

describe('ForbiddenError', () => {
  it('debería usar status 403 y mensaje por defecto', () => {
    const error = new ForbiddenError();

    expect(error.statusCode).toBe(403);
    expect(error.message).toBe('Acceso prohibido');
    expect(error.name).toBe('ForbiddenError');
  });

  it('debería permitir un mensaje personalizado', () => {
    const error = new ForbiddenError('No tienes permisos');

    expect(error.statusCode).toBe(403);
    expect(error.message).toBe('No tienes permisos');
  });
});

describe('NotFoundError', () => {
  it('debería usar status 404 y mensaje por defecto', () => {
    const error = new NotFoundError();

    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Recurso no encontrado');
    expect(error.name).toBe('NotFoundError');
  });

  it('debería permitir un mensaje personalizado', () => {
    const error = new NotFoundError('Usuario no encontrado');

    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Usuario no encontrado');
  });
});

describe('ConflictError', () => {
  it('debería usar status 409 y mensaje por defecto', () => {
    const error = new ConflictError();

    expect(error.statusCode).toBe(409);
    expect(error.message).toBe('El recurso ya existe');
    expect(error.name).toBe('ConflictError');
  });

  it('debería permitir un mensaje personalizado', () => {
    const error = new ConflictError('El email ya está registrado');

    expect(error.statusCode).toBe(409);
    expect(error.message).toBe('El email ya está registrado');
  });
});
