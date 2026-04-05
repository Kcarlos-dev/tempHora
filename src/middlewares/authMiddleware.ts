import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';

interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const payload = verifyToken(token) as TokenPayload;
    req.user = { id: payload.userId, email: payload.email, role: payload.role };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido.' });
  }
};

export default authMiddleware;
