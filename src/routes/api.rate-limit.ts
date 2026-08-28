import { rateLimit } from 'express-rate-limit';

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      message: 'Demasiados intentos. Intenta nuevamente más tarde.',
    });
  },
});
