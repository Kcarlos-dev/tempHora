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
  }
};

export default userService;
