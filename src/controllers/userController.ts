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

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = Number(req.user?.id);

    if (!userId) {
      return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    const me = await userService.getMe(userId);
    return res.json(me);
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
    if(role === "root"){
      return res.status(400).json({ message: 'root não é permitido' });
    }
    const user = await userService.createUser({ email, password, name, role });
    return res.status(201).json({ message: 'Usuário criado com sucesso.', user });
  } catch (error) {
    next(error);
  }
}
export async function updateUserPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { id_empresa } = req.params;
    const { password,email } = req.body;
    if (!password || !id_empresa || !email) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }
    const user = await userService.updateUserPassword(Number(id_empresa), email, password);
    return res.json({ message: 'Senha atualizada com sucesso.', user: user });
  } catch (error) {
    next(error);
  }
}