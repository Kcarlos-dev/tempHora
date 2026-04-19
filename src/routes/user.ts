import { Router } from 'express';
import { getUser, getMe, createUser, updateUserPassword } from '../controllers/userController';
import authMiddleware from '../middlewares/authMiddleware';
import authOnly from '../middlewares/authOnly';
import roleMiddleware from '../middlewares/roleMiddleware';

const router = Router();

// Perfil do próprio usuário logado (view vw_users_colaboradores + URL assinada da foto).
// Usa `authOnly` porque esse endpoint é "self" e não carrega :id_empresa na URL.
router.get('/me', authOnly, getMe);

router.get('/', authMiddleware, roleMiddleware(['root']), getUser);

// Rota para criar usuário - apenas admin e root
router.post('/:id_empresa', authMiddleware, roleMiddleware(['admin', 'root', 'rh']), createUser);

router.put('/:id_empresa', authMiddleware, roleMiddleware(['admin', 'root']), updateUserPassword);
export default router;

