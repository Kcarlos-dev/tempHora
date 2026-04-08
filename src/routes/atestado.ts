import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import roleMiddleware from '../middlewares/roleMiddleware';
import {
  createAtestado,
  deleteAtestado,
  getAtestadoByIdColaborador,
  listAtestados,
  updateAtestado
} from '../controllers/atestadoController';

const router = Router();

//router.get('/', listAtestados);
router.get('/:id_empresa/:id_colaborador',authMiddleware, getAtestadoByIdColaborador);
router.post('/:id_empresa',authMiddleware, roleMiddleware(['admin', 'root', 'rh', 'colaborador']), createAtestado);
router.put('/:id_empresa/:id',authMiddleware, roleMiddleware(['admin', 'root', 'rh']), updateAtestado);
router.delete('/:id_empresa/:id',authMiddleware, roleMiddleware(['admin', 'root']), deleteAtestado);

export default router;
