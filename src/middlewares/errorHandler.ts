import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import logger from '../config/logger';

export default function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error(err.stack || err.message);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  return res.status(500).json({ message: 'Erro interno no servidor.' });
}
