import { describe, expect, it } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { apiRateLimiter } from '../../routes/api.rate-limit';

describe('apiRateLimiter', () => {
  it('debería bloquear después de 10 intentos fallidos', async () => {
    const app = express();

    app.use(apiRateLimiter);

    app.post('/user', (_req, res) => {
      res.status(401).json({
        message: 'Credenciales inválidas',
      });
    });

    // 10 intentos fallidos permitidos
    for (let i = 0; i < 10; i++) {
      const response = await request(app).post('/user');

      expect(response.status).toBe(401);
    }

    // 11° intento → 429
    const response = await request(app).post('/user');

    expect(response.status).toBe(429);

    expect(response.body).toEqual({
      message: 'Demasiados intentos. Intenta nuevamente más tarde.',
    });
  });
});
