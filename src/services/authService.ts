import bcrypt from 'bcrypt';
import userModel from '../models/userModel';
import { signToken } from '../config/jwt';
import AppError from '../utils/AppError';

const authService = {
  async login(email: string, password: string) {
    const user = await userModel.findByEmail(email);

    if (!user) {
      throw new AppError('Usuário ou senha inválidos.', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      throw new AppError('Usuário ou senha inválidos.', 401);
    }

    return signToken({ userId: user.id_user,empresaId:user.id_empresa,colaboradorId:user.id_colaborador, email: user.email, role: user.role,status:user.status });
  }
};

export default authService;
