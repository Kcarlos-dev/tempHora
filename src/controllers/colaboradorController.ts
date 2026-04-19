import crypto from 'crypto';
import path from 'path';
import { NextFunction, Request, Response } from 'express';
import colaboradorService from '../services/colaboradorService';
import { bucket } from '../config/storage';
import { generateSignedUrl } from '../utils/gcs';

async function attachFotoUrl<T extends { foto?: string | null }>(
  colaborador: T,
): Promise<T & { foto_url: string | null }> {
  const foto_url = await generateSignedUrl(colaborador.foto ?? null);
  return { ...colaborador, foto_url };
}

export async function listColaboradores(req: Request, res: Response, next: NextFunction) {
  try {
    const id_empresa = Number(req.params.id_empresa)
    const colaboradores = await colaboradorService.list(id_empresa);
    return res.json(colaboradores);
  } catch (error) {
    next(error);
  }
}

export async function getColaboradorByCpf(req: Request, res: Response, next: NextFunction) {
  try {
    const cpf:string = req.params.cpf ;
    const colaborador = await colaboradorService.getByCpf(cpf);
    return res.json(colaborador);
  } catch (error) {
    next(error);
  }
}

export async function createColaborador(req: Request, res: Response, next: NextFunction) {
  try {
    const { id_empresa, id_user, full_name, cpf, phone, position, status } = req.body;

    if (!id_empresa || !id_user || !full_name) {
      return res.status(400).json({ message: 'id_empresa, id_user e full_name são obrigatórios.' });
    }

    const colaborador = await colaboradorService.create({
      id_empresa: Number(id_empresa),
      id_user: Number(id_user),
      full_name,
      cpf,
      phone,
      position,
      status
    });

    return res.status(201).json(colaborador);
  } catch (error) {
    next(error);
  }
}

export async function updateColaborador(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { id_empresa, id_user, full_name, cpf, phone, position, status } = req.body;

    if (!id_empresa || !id_user || !full_name) {
      return res.status(400).json({ message: 'id_empresa, id_user e full_name são obrigatórios.' });
    }

    const colaborador = await colaboradorService.update(id, {
      id_empresa: Number(id_empresa),
      id_user: Number(id_user),
      full_name,
      cpf,
      phone,
      position,
      status
    });

    return res.json(colaborador);
  } catch (error) {
    next(error);
  }
}

export async function updateColaboradorStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'status é obrigatório.' });
    }

    const colaborador = await colaboradorService.updateStatus(id, status);
    return res.json(colaborador);
  } catch (error) {
    next(error);
  }
}

export async function uploadFotoColaborador(req: Request, res: Response, next: NextFunction) {
  try {
    const id_colaborador = Number(req.params.id_colaborador);
    const file = req.file;

    if (!id_colaborador || Number.isNaN(id_colaborador)) {
      return res.status(400).json({ message: 'id_colaborador inválido.' });
    }
    if (!file) {
      return res.status(400).json({ message: 'foto é obrigatória.' });
    }

    const ext = path.extname(file.originalname) || '.jpg';
    const filename = `colaboradores/${id_colaborador}/perfil_${Date.now()}_${crypto.randomUUID()}${ext}`;

    const blob = bucket.file(filename);
    await blob.save(file.buffer, {
      contentType: file.mimetype,
      resumable: false,
    });

    const fotoPath = `gs://${bucket.name}/${filename}`;
    const colaborador = await colaboradorService.updateFoto(id_colaborador, fotoPath);

    return res.json(await attachFotoUrl(colaborador));
  } catch (error) {
    next(error);
  }
}
