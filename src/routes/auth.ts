import { Router } from 'express';
import { login } from '../controllers/authController';
import loginLimiter from '../middlewares/loginLimiter';

const router = Router();

router.post('/login', loginLimiter, login);

export default router;
