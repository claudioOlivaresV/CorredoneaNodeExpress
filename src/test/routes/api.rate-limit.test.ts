import { describe, expect, it } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { apiRateLimiter } from '../../routes/api.rate-limit';

describe('apiRateLimiter', () => {
  it('debería bloquear después de 5 intentos', async () => {
    const app = express();

    app.use(apiRateLimiter);

    app.post('/user', (req, res) => {
      res.status(200).json({ message: 'OK' });
    });

    // 10 intentos permitidos
    for (let i = 0; i < 10; i++) {
      await request(app).post('/user');
    }

    // 6° intento → 429
    const response = await request(app).post('/user');

    expect(response.status).toBe(429);

    expect(response.body).toEqual({
      message: 'Demasiados intentos. Intenta nuevamente más tarde.',
    });
  });
});
