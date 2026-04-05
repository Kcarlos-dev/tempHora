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

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, senha e nome são obrigatórios.' });
    }

    const user = await userService.createUser({ email, password, name, role });
    return res.status(201).json({ message: 'Usuário criado com sucesso.', user });
  } catch (error) {
    next(error);
  }
}
