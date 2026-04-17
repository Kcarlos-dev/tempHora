import { Router } from 'express';
import { getUser, createUser, updateUserPassword } from '../controllers/userController';
import authMiddleware from '../middlewares/authMiddleware';
import roleMiddleware from '../middlewares/roleMiddleware';

const router = Router();

router.get('/', authMiddleware,roleMiddleware(['root']), getUser);

// Rota para criar usuário - apenas admin e root
router.post('/:id_empresa', authMiddleware, roleMiddleware(['admin', 'root','rh']), createUser);

router.put('/:id_empresa', authMiddleware, roleMiddleware(['admin', 'root']), updateUserPassword);
export default router;
