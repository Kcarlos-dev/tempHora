import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import roleMiddleware from '../middlewares/roleMiddleware';
import upload from '../middlewares/upload';
import { createPonto, deletePonto, getPontoByIdColaborador, getCsvPontoColaborador, listPontosByEmpresa, updatePonto } from '../controllers/pontoController';

const router = Router();

//router.get('/', listPontos);
router.get('/planilha/:id_empresa/:id_colaborador/:data_inicial/:data_final',authMiddleware,getCsvPontoColaborador)
router.get('/:id_empresa/:id_colaborador',authMiddleware, getPontoByIdColaborador);
router.get('/:id_empresa', authMiddleware, roleMiddleware(['admin', 'root', 'rh']), listPontosByEmpresa);
router.post('/:id_empresa',authMiddleware, roleMiddleware(['admin', 'root', 'rh', 'colaborador']), upload.single('foto'), createPonto);
router.put('/:id_empresa/:id',authMiddleware, roleMiddleware(['admin', 'root', 'rh']), updatePonto);
router.delete('/:id_empresa/:id',authMiddleware, roleMiddleware(['admin', 'root']), deletePonto);

export default router;
