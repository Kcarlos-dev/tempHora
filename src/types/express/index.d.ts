import 'express';

declare global {
  namespace Express {
    interface Request {
      id_empresa?: number; // 👈 FALTAVA ISSO
      user?: {
        id: number;
        email: string;
        role: string;
      };
    }
  }
}