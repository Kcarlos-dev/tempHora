import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import config from './index';

const signOptions: SignOptions = {
  expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'],
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, signOptions);
}

export function verifyToken(token: string) {
  return jwt.verify(token, config.jwt.secret) as { userId: number; email: string };
}
