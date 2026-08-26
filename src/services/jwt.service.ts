import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../errors/app.errors';

export class JwtService {
  generateToken(payload: object): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET no configurado');
    }

    try {
      return jwt.sign(payload, secret, {
        expiresIn: '1h',
      });
    } catch {
      throw new UnauthorizedError('No se pudo generar el token');
    }
  }
}
