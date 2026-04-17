import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import roleMiddleware from '../middlewares/roleMiddleware';
import uploadAtestado from '../middlewares/uploadAtestado';
import {
  createAtestado,
  deleteAtestado,
  getAtestadoByCpfColaborador,
  listAtestados,
  updateAtestado
} from '../controllers/atestadoController';

const router = Router();

//router.get('/', listAtestados);
router.get('/:id_empresa/cpf/:cpf',authMiddleware, getAtestadoByCpfColaborador);
router.post('/:id_empresa/:id_colaborador',authMiddleware, roleMiddleware(['admin', 'root', 'rh', 'colaborador']), uploadAtestado.single('arquivo'), createAtestado);
router.put('/:id_empresa/:id',authMiddleware, roleMiddleware(['admin', 'root', 'rh']), updateAtestado);
router.delete('/:id_empresa/:id',authMiddleware, roleMiddleware(['admin', 'root']), deleteAtestado);

export default router;
