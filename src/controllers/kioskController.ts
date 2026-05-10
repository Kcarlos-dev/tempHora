import { Request, Response, NextFunction } from 'express';
import FormData from 'form-data';
import RequisicaoApiFace from '../services/axiosService';
import colaboradorService from '../services/colaboradorService';
import config from '../config';
import { generateSignedUrl } from '../utils/gcs';


export async function matchFace(req: Request, res: Response, next: NextFunction) {
  try {
    const { id_empresa } = req.params;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ message: 'Foto é obrigatória.' });
    }

    if (!config.temphoraApiFace.url?.trim()) {
      return res.status(503).json({ message: 'Serviço de reconhecimento facial indisponível.' });
    }

    const form = new FormData();
    form.append('file', file.buffer, {
      filename: file.originalname || 'kiosk.jpg',
      contentType: file.mimetype || 'image/jpeg',
    });
    form.append('id_empresa', String(id_empresa));

    try {
      const response = await RequisicaoApiFace.post(
        `${config.temphoraApiFace.url}/match`,
        form,
      );
      const best_id_colaborador = response.best_id_colaborador;
      if (!response.match) {
        return res.status(400).json({ message: 'Reconhecimento facial não encontrado.' });
      }

      let colaborador = await colaboradorService.getById(best_id_colaborador);
      let foto_url = await generateSignedUrl(colaborador.foto ?? null);
      colaborador.foto = foto_url;

      return res.json(colaborador);
    } finally {
      const r = req as { file?: Express.Multer.File; files?: unknown };
      delete r.file;
      delete r.files;
    }
  } catch (error) {
    next(error);
  }
}

export default { matchFace };
