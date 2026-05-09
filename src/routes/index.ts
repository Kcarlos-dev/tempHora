import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './user';
import empresaRoutes from './empresa';
import colaboradorRoutes from './colaborador';
import pontoRoutes from './ponto';
import atestadoRoutes from './atestado';
import kioskRoutes from './kiosk';
const router = Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/empresa', empresaRoutes);
router.use('/colaborador', colaboradorRoutes);
router.use('/ponto', pontoRoutes);
router.use('/atestado', atestadoRoutes);
router.use('/kiosk', kioskRoutes);
export default router;
