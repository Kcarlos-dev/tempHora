import jwt from 'jsonwebtoken';
import config from './index';

export function signToken(payload: object) {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

export function verifyToken(token: string) {
  return jwt.verify(token, config.jwt.secret) as { userId: number; email: string };
}
