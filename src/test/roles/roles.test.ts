import { describe, expect, it, jest } from '@jest/globals';
import request from 'supertest';

import app from '../../app';
import { prisma } from '../../config/prismaConfig';

describe('GET /api/roles', () => {
  it('debería retornar los roles', async () => {
    const response = await request(app).get('/api/roles');

    expect(response.status).toBe(200);
  });

  it('debería retornar 500 si ocurre un error', async () => {
    jest
      .spyOn(prisma.roles, 'findMany')
      .mockRejectedValue(new Error('Error DB'));

    const response = await request(app).get('/api/roles');

    expect(response.status).toBe(500);

    expect(response.body.message).toBe('Error al obtener los roles');
  });
});
