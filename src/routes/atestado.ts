import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import roleMiddleware from '../middlewares/roleMiddleware';
import {
  createAtestado,
  deleteAtestado,
  getAtestadoById,
  listAtestados,
  updateAtestado
} from '../controllers/atestadoController';

const router = Router();

router.use(authMiddleware);

router.get('/', listAtestados);
router.get('/:id', getAtestadoById);
router.post('/', roleMiddleware(['admin', 'root', 'rh', 'colaborador']), createAtestado);
router.put('/:id', roleMiddleware(['admin', 'root', 'rh']), updateAtestado);
router.delete('/:id', roleMiddleware(['admin', 'root']), deleteAtestado);

export default router;
