import cacheClient, { connectCache } from '../config/cache';
import userModel from '../models/userModel';
import AppError from '../utils/AppError';

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
  }
};

export default userService;
