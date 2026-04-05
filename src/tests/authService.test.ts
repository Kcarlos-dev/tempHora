import bcrypt from 'bcrypt';
import authService from '../services/authService';
import userModel from '../models/userModel';
import AppError from '../utils/AppError';

jest.mock('bcrypt');
jest.mock('../models/userModel');

const mockedUserModel = userModel as jest.Mocked<typeof userModel>;
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('authService', () => {
  describe('login', () => {
    it('should return a JWT when credentials are valid', async () => {
      mockedUserModel.findByEmail.mockResolvedValue({
        id: 1,
        name: 'Teste',
        email: 'teste@teste.com',
        password_hash: 'hash'
      });
      mockedBcrypt.compare.mockResolvedValue(true);

      const token = await authService.login('teste@teste.com', 'senha');

      expect(token).toEqual(expect.any(String));
      expect(mockedUserModel.findByEmail).toHaveBeenCalledWith('teste@teste.com');
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('senha', 'hash');
    });

    it('should throw AppError when the user is not found', async () => {
      mockedUserModel.findByEmail.mockResolvedValue(null);

      await expect(authService.login('nao@existe.com', 'senha')).rejects.toThrow(AppError);
    });

    it('should throw AppError when the password is invalid', async () => {
      mockedUserModel.findByEmail.mockResolvedValue({
        id: 1,
        name: 'Teste',
        email: 'teste@teste.com',
        password_hash: 'hash'
      });
      mockedBcrypt.compare.mockResolvedValue(false);

      await expect(authService.login('teste@teste.com', 'senhaErrada')).rejects.toThrow(AppError);
    });
  });
});
