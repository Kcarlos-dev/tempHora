import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import roleMiddleware from '../middlewares/roleMiddleware';
import checkCompany from '../middlewares/checkCompany';
import {
  createColaborador,
  getColaboradorByCpf,
  listColaboradores,
  updateColaboradorStatus,
  updateColaborador
} from '../controllers/colaboradorController';

const router = Router();

router.get('/:id_empresa',authMiddleware,roleMiddleware(['admin', 'root', 'rh']), listColaboradores);
router.get('/:id_empresa/:cpf',authMiddleware, getColaboradorByCpf);
router.post('/:id_empresa',authMiddleware, roleMiddleware(['admin', 'root', 'rh']), createColaborador);
router.put('/:id_empresa/:id',authMiddleware, roleMiddleware(['admin', 'root', 'rh']), updateColaborador);
router.patch('/:id_empresa/:id/status',authMiddleware, roleMiddleware(['admin', 'root', 'rh']), updateColaboradorStatus);

export default router;
