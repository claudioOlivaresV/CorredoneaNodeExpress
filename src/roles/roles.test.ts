import { describe, expect, it } from '@jest/globals';

import request from 'supertest';
import app from '../app';

describe('GET /api/roles', () => {
  it('debería retornar los roles', async () => {
    const response = await request(app).get('/api/roles');

    expect(response.status).toBe(200);
  });
});
