import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';

// Limitador exclusivo do endpoint de login. Mais restritivo que o global,
// focado em conter brute-force/credential stuffing.
// - Janela curta (15 min) e volume baixo por IP.
// - `skipSuccessfulRequests: true`: contabiliza apenas tentativas que falharam
//   (status >= 400), pra não punir usuário legítimo que loga várias vezes.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,

  handler: (req: Request, res: Response) => {
    const resetTime = req.rateLimit?.resetTime
      ? Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000)
      : 0;

    res.status(429).json({
      status: 'error',
      message: 'Muitas tentativas de login. Tente novamente em alguns minutos.',
      retryAfter: resetTime,
    });
  },
});

export default loginLimiter;
