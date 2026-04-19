import cacheClient, { connectCache } from '../config/cache';
import userModel from '../models/userModel';
import AppError from '../utils/AppError';
import { generateSignedUrl } from '../utils/gcs';

const CACHE_PREFIX = 'user_profile:';

const userService = {
  async getUserProfile(userId: number) {
    await connectCache();
    const cacheKey = `${CACHE_PREFIX}${userId}`;
    const cached = await cacheClient.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const user = await userModel.findById(userId);

    if (!user) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    const result = {
      id: user.id,
      name: user.name,
      email: user.email
    };

    await cacheClient.setEx(cacheKey, 60 * 5, JSON.stringify(result));
    return result;
  },

  async createUser(data: { email: string; password: string; name: string; role?: string }) {
    const { email, password, name, role = 'user' } = data;

    const existingUser = await userModel.findByEmail(email);

    if (existingUser) {
      throw new AppError('Usuário com este email já existe.', 409);
    }

    const user = await userModel.create({
      email,
      password,
      name,
      role
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
  },
  
  async updateUserPassword(id_empresa: number, email: string, password: string) {
    const user = await userModel.updatePassword(id_empresa, email, password);
    if (!user) {
      throw new AppError('Usuário não encontrado ou não pertence a sua empresa', 404);
    }
    return user;
  },

  async getMe(userId: number) {
    const user = await userModel.findProfileByUserId(userId);

    if (!user) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    const foto_url = await generateSignedUrl(user.foto ?? null);

    return {
      id_user: user.id_user,
      id_empresa: user.id_empresa,
      id_colaborador: user.id_colaborador,
      name: user.name,
      full_name: user.full_name,
      cpf: user.cpf,
      email: user.email,
      role: user.role,
      status: user.status,
      foto: user.foto,
      foto_url,
    };
  },
};

export default userService;
