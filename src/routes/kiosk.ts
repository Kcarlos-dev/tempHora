import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import roleMiddleware from '../middlewares/roleMiddleware';
import upload from '../middlewares/upload';
import { matchFace } from '../controllers/kioskController';


const router = Router();



router.post('/:id_empresa',authMiddleware, roleMiddleware(['kiosk']), upload.single('foto'), matchFace);


export default router;