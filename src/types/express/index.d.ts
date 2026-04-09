import 'express';

declare global {
  namespace Express {
    interface Request {
      id_empresa?: number;

      user?: {
        id: number;
        email: string;
        role: string;
      };
      
      rateLimit?: {
        limit: number;
        current: number;
        remaining: number;
        resetTime?: number;
      };
    }
  }
}