import { Router } from 'express';
import { getUser, createUser } from '../controllers/userController';
import authMiddleware from '../middlewares/authMiddleware';
import roleMiddleware from '../middlewares/roleMiddleware';

const router = Router();

router.get('/', authMiddleware, getUser);

// Rota para criar usuário - apenas admin e root
router.post('/', authMiddleware, roleMiddleware(['admin', 'root']), createUser);

export default router;
