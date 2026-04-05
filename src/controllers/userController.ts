import { Request, Response, NextFunction } from 'express';
import userService from '../services/userService';

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = Number(req.user?.id);

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const user = await userService.getUserProfile(userId);
    return res.json(user);
  } catch (error) {
    next(error);
  }
}
