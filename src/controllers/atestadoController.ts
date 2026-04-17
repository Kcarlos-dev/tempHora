import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import path from 'path';
import atestadoService from '../services/atestadoService';
import { bucket } from '../config/storage';

export async function listAtestados(req: Request, res: Response, next: NextFunction) {
  try {
    const atestados = await atestadoService.list();
    return res.json(atestados);
  } catch (error) {
    next(error);
  }
}

export async function getAtestadoByCpfColaborador(req: Request, res: Response, next: NextFunction) {
  try {
    const id_empresa = Number(req.params.id_empresa);
    const cpf = req.params.cpf;

    if (!cpf) {
      return res.status(400).json({ message: 'cpf é obrigatório.' });
    }

    const atestado = await atestadoService.getByCpfColaborador(id_empresa, cpf);
    return res.json(atestado);
  } catch (error) {
    next(error);
  }
}

export async function createAtestado(req: Request, res: Response, next: NextFunction) {
  try {
    const { id_colaborador, data_inicio, data_fim, arquivo, status } = req.body;
    const file = req.file;

    if (!id_colaborador || !data_inicio || !data_fim) {
      return res.status(400).json({ message: 'id_colaborador, data_inicio e data_fim são obrigatórios.' });
    }

    let arquivoSalvo = arquivo;
    if (file) {
      const ext = path.extname(file.originalname) || '.pdf';
      const filename = `atestados/${id_colaborador}/${Date.now()}_${crypto.randomUUID()}${ext}`;
      const blob = bucket.file(filename);

      await blob.save(file.buffer, {
        contentType: file.mimetype,
        resumable: false,
      });

      arquivoSalvo = `gs://${bucket.name}/${filename}`;
    }

    const atestado = await atestadoService.create({
      id_colaborador: Number(id_colaborador),
      data_inicio,
      data_fim,
      arquivo: arquivoSalvo,
      status
    });

    return res.status(201).json(atestado);
  } catch (error) {
    next(error);
  }
}

export async function updateAtestado(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { id_colaborador, data_inicio, data_fim, arquivo, status } = req.body;

    if (!id_colaborador || !data_inicio || !data_fim) {
      return res.status(400).json({ message: 'id_colaborador, data_inicio e data_fim são obrigatórios.' });
    }

    const atestado = await atestadoService.update(id, {
      id_colaborador: Number(id_colaborador),
      data_inicio,
      data_fim,
      arquivo,
      status
    });

    return res.json(atestado);
  } catch (error) {
    next(error);
  }
}

export async function deleteAtestado(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await atestadoService.remove(id);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}
