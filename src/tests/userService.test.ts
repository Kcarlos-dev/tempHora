import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import AppError from '../utils/AppError';
import cacheClient, { connectCache } from '../config/cache';
import userModel from '../models/userModel';
import userService from '../services/userService';

jest.mock('../config/cache');
jest.mock('../models/userModel');

const mockedCacheClient = cacheClient as jest.Mocked<typeof cacheClient>;
const mockedConnectCache = connectCache as jest.MockedFunction<typeof connectCache>;
const mockedUserModel = userModel as jest.Mocked<typeof userModel>;

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns cached profile when cache contains data', async () => {
    mockedConnectCache.mockResolvedValue(undefined);
    mockedCacheClient.get.mockResolvedValue(JSON.stringify({ id: 1, name: 'Teste', email: 'teste@teste.com' }));

    const result = await userService.getUserProfile(1);

    expect(result).toEqual({ id: 1, name: 'Teste', email: 'teste@teste.com' });
    expect(mockedUserModel.findById).not.toHaveBeenCalled();
  });

  it('fetches from database and caches the result when no cache exists', async () => {
    mockedConnectCache.mockResolvedValue(undefined);
    mockedCacheClient.get.mockResolvedValue(null);
    mockedUserModel.findById.mockResolvedValue({
      id: 1,
      name: 'Teste',
      email: 'teste@teste.com',
      password_hash: 'hash'
    });
    mockedCacheClient.setEx.mockResolvedValue('OK');

    const result = await userService.getUserProfile(1);

    expect(result).toEqual({ id: 1, name: 'Teste', email: 'teste@teste.com' });
    expect(mockedCacheClient.setEx).toHaveBeenCalledWith('user_profile:1', 300, JSON.stringify(result));
  });

  it('throws AppError when user is not found', async () => {
    mockedConnectCache.mockResolvedValue(undefined);
    mockedCacheClient.get.mockResolvedValue(null);
    mockedUserModel.findById.mockResolvedValue(null);

    await expect(userService.getUserProfile(1)).rejects.toThrow(AppError);
  });
});
