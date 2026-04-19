import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';

interface TokenPayload {
  userId: number;
  empresaId: number;
  colaboradorId: number;
  email: string;
  role: string;
  status: string;
}

/**
 * Middleware leve: apenas valida o JWT e popula `req.user`. Use em endpoints
 * de "self" (ex.: /user/me) que não dependem de `:id_empresa` na URL — o
 * `authMiddleware` padrão recusaria a request por falta de empresa.
 */
const authOnly = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const payload = verifyToken(token) as TokenPayload;
    if (payload.status === 'inativo') {
      return res.status(403).json({ message: 'Você não está em atividade' });
    }
    req.user = { id: payload.userId, email: payload.email, role: payload.role };
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido.' });
  }
};

export default authOnly;
