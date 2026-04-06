import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import roleMiddleware from '../middlewares/roleMiddleware';
import { createPonto, deletePonto, getPontoById, listPontos, updatePonto } from '../controllers/pontoController';

const router = Router();

router.use(authMiddleware);

router.get('/', listPontos);
router.get('/:id', getPontoById);
router.post('/', roleMiddleware(['admin', 'root', 'rh', 'colaborador']), createPonto);
router.put('/:id', roleMiddleware(['admin', 'root', 'rh']), updatePonto);
router.delete('/:id', roleMiddleware(['admin', 'root']), deletePonto);

export default router;
