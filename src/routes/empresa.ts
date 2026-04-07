import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import roleMiddleware from '../middlewares/roleMiddleware';
import {
  createEmpresa,
  deleteEmpresa,
  getEmpresaById,
  listEmpresas,
  updateEmpresa
} from '../controllers/empresaController';

const router = Router();

router.use(authMiddleware);

//router.get('/', listEmpresas);
router.get('/:id', getEmpresaById);
router.post('/', roleMiddleware(['root']), createEmpresa);
router.put('/:id', roleMiddleware(['admin', 'root', 'rh']), updateEmpresa);
router.delete('/:id', roleMiddleware(['root']), deleteEmpresa);

export default router;
