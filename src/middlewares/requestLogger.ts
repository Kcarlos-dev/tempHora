import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    logger.info('%s %s %d %dms', req.method, req.originalUrl, res.statusCode, durationMs);
  });

  next();
};

export default requestLogger;
