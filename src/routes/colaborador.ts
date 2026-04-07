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

router.use(authMiddleware);

router.get('/empresa/:id_empresa',roleMiddleware(['admin', 'root', 'rh']), listColaboradores);
router.get('/user/:cpf', getColaboradorByCpf);
router.post('/', [roleMiddleware(['admin', 'root', 'rh']),checkCompany], createColaborador);
router.put('/:id', roleMiddleware(['admin', 'root', 'rh']), updateColaborador);
router.patch('/:id/status', roleMiddleware(['admin', 'root', 'rh']), updateColaboradorStatus);

export default router;
