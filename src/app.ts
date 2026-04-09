import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import requestLogger from './middlewares/requestLogger';
import errorHandler from './middlewares/errorHandler';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutos
  limit: 120,
  standardHeaders: 'draft-8',
  legacyHeaders: false,

  message: {
    status: 429,
    error: 'Too Many Requests',
    message: 'Muitas requisições deste IP. Tente novamente em alguns minutos.',
  },

  handler: (req: express.Request, res: express.Response) => {
    const resetTime = req.rateLimit?.resetTime 
      ? Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
      : 0;

    res.status(429).json({
      status: 'error',
      message: 'Limite de requisições excedido.',
      retryAfter: resetTime,
    });
  },
});

app.use(apiLimiter);

app.use('/api', routes);
app.use(errorHandler);

export default app;
