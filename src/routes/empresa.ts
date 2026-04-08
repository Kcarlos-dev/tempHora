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


//router.get('/', listEmpresas);
router.get('/:id_empresa',authMiddleware, getEmpresaById);
router.post('/',authMiddleware, roleMiddleware(['root']), createEmpresa);
router.put('/:id_empresa',authMiddleware, roleMiddleware(['admin', 'root', 'rh']), updateEmpresa);
router.delete('/:id_empresa',authMiddleware, roleMiddleware(['root']), deleteEmpresa);

export default router;
