import { describe, expect, it } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { loginRateLimiter } from '../../../auth/login/auth.rate-limit';

describe('loginRateLimiter', () => {
  it('debería bloquear después de 5 intentos', async () => {
    const app = express();

    app.use(loginRateLimiter);

    app.post('/login', (req, res) => {
      res.status(200).json({ message: 'OK' });
    });

    // 5 intentos permitidos
    for (let i = 0; i < 5; i++) {
      await request(app).post('/login');
    }

    // 6° intento → 429
    const response = await request(app).post('/login');

    expect(response.status).toBe(429);

    expect(response.body).toEqual({
      message: 'Demasiados intentos. Intenta nuevamente más tarde.',
    });
  });
});
