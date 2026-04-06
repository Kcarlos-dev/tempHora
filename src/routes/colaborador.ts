import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import roleMiddleware from '../middlewares/roleMiddleware';
import {
  createColaborador,
  getColaboradorById,
  listColaboradores,
  updateColaboradorStatus,
  updateColaborador
} from '../controllers/colaboradorController';

const router = Router();

router.use(authMiddleware);

router.get('/', listColaboradores);
router.get('/:id', getColaboradorById);
router.post('/', roleMiddleware(['admin', 'root', 'rh']), createColaborador);
router.put('/:id', roleMiddleware(['admin', 'root', 'rh']), updateColaborador);
router.patch('/:id/status', roleMiddleware(['admin', 'root', 'rh']), updateColaboradorStatus);

export default router;
