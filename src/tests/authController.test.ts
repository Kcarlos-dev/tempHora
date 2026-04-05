import request from 'supertest';
import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import app from '../app';
import authService from '../services/authService';

jest.mock('../services/authService');

const mockedAuthService = authService as jest.Mocked<typeof authService>;

describe('Auth controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('responds with a token for valid credentials', async () => {
    mockedAuthService.login.mockResolvedValue('jwt-token');

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'teste@teste.com', password: 'senha' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ token: 'jwt-token' });
  });

  it('returns 400 when email or password is missing', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/E-mail e senha são obrigatórios/);
  });
});
