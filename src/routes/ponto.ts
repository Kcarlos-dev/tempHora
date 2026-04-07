import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import roleMiddleware from '../middlewares/roleMiddleware';
import { createPonto, deletePonto, getPontoById, listPontos, updatePonto } from '../controllers/pontoController';

const router = Router();

//router.get('/', listPontos);
router.get('/:id_empresa/:id_colaborador',authMiddleware, getPontoById);
router.post('/:id_empresa',authMiddleware, roleMiddleware(['admin', 'root', 'rh', 'colaborador']), createPonto);
router.put('/:id_empresa/:id',authMiddleware, roleMiddleware(['admin', 'root', 'rh']), updatePonto);
router.delete('/:id_empresa/:id',authMiddleware, roleMiddleware(['admin', 'root']), deletePonto);

export default router;
