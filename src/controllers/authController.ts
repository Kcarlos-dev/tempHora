import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }

    const token = await authService.login(email, password);

    return res.json({ token });
  } catch (error) {
    next(error);
  }
}
