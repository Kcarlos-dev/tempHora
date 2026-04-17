import crypto from 'crypto';
import path from 'path';
import { Parser } from "json2csv";
import { NextFunction, Request, Response } from 'express';
import pontoService from '../services/pontoService';
import { bucket } from '../config/storage';

const SIGNED_URL_EXPIRATION = 60 * 60 * 1000; // 1 hora

async function generateSignedUrl(gcsPath: string): Promise<string> {
  const filePath = gcsPath.replace(`gs://${bucket.name}/`, '');
  const [url] = await bucket.file(filePath).getSignedUrl({
    action: 'read',
    expires: Date.now() + SIGNED_URL_EXPIRATION,
  });
  return url;
}

async function attachFotoUrl<T extends { foto?: string | null }>(ponto: T): Promise<T & { foto_url: string | null }> {
  const foto_url = ponto.foto ? await generateSignedUrl(ponto.foto) : null;
  return { ...ponto, foto_url };
}

async function attachFotoUrls<T extends { foto?: string | null }>(pontos: T[]): Promise<(T & { foto_url: string | null })[]> {
  return Promise.all(pontos.map(p => attachFotoUrl(p)));
}

export async function listPontos(req: Request, res: Response, next: NextFunction) {
  try {
    const pontos = await pontoService.list();
    return res.json(await attachFotoUrls(pontos));
  } catch (error) {
    next(error);
  }
}

export async function getCsvPontoColaborador(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id_colaborador);
    const data_inicial:string = req.params.data_inicial
    const data_final:string = req.params.data_final

    if(data_final.length <= 0 || data_inicial.length <= 0){
      return res.status(400).json({message:'É preciso colocar uma data final e inicial'})
    }

    const ponto = await pontoService.getCsvByIdColaborador(id,data_inicial,data_final);
    
    if(ponto.length <= 0){
        return res.status(401).json({message:'Não possue ponto registrado'})
    }
    const parser = new Parser();
    const csv = parser.parse(ponto);

    res.header("Content-Type", "text/csv");
    res.attachment(`ponto_${id}.csv`);

    return res.send(csv);
  } catch (error) {
    next(error)
  }
}

export async function getPontoByIdColaborador(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id_colaborador);
    const pontos = await pontoService.getByIdColaborador(id);
    return res.json(await attachFotoUrls(pontos));
  } catch (error) {
    next(error);
  }
}

export async function listPontosByEmpresa(req: Request, res: Response, next: NextFunction) {
  try {
    const idEmpresa = Number(req.params.id_empresa);
    if (!idEmpresa || Number.isNaN(idEmpresa)) {
      return res.status(400).json({ message: 'id_empresa inválido.' });
    }

    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? req.query.limit ?? 20);

    const result = await pontoService.listByEmpresa(idEmpresa, page, pageSize);

    return res.json({
      ...result,
      data: await attachFotoUrls(result.data),
    });
  } catch (error) {
    next(error);
  }
}

export async function createPonto(req: Request, res: Response, next: NextFunction) {
  try {
    const { id_colaborador, tipo, data_hora, latitude, longitude } = req.body;
    const file = req.file;
 
    if (!file) {
      return res.status(400).json({ message: 'foto é obrigatório.' });
    }
    if (!id_colaborador || !tipo || !data_hora) {
      return res.status(400).json({ message: 'id_colaborador, tipo e data_hora são obrigatórios.' });
    }

    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `pontos/${id_colaborador}/${Date.now()}_${crypto.randomUUID()}${ext}`;

    const blob = bucket.file(filename);
    await blob.save(file.buffer, {
      contentType: file.mimetype,
      resumable: false,
    });

    const fotoUrl = `gs://${bucket.name}/${filename}`;

    const ponto = await pontoService.create({
      id_colaborador: Number(id_colaborador),
      tipo,
      data_hora,
      latitude: latitude !== undefined ? Number(latitude) : null,
      longitude: longitude !== undefined ? Number(longitude) : null,
      foto: fotoUrl,
    });

    return res.status(201).json(await attachFotoUrl(ponto));
  } catch (error) {
    next(error);
  }
}

export async function updatePonto(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { id_colaborador, tipo, data_hora, latitude, longitude, foto } = req.body;

    if (!id_colaborador || !tipo || !data_hora) {
      return res.status(400).json({ message: 'id_colaborador, tipo e data_hora são obrigatórios.' });
    }

    const ponto = await pontoService.update(id, {
      id_colaborador: Number(id_colaborador),
      tipo,
      data_hora,
      latitude: latitude !== undefined ? Number(latitude) : null,
      longitude: longitude !== undefined ? Number(longitude) : null,
      foto
    });

    return res.json(await attachFotoUrl(ponto));
  } catch (error) {
    next(error);
  }
}

export async function deletePonto(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await pontoService.remove(id);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}
