import { NextFunction, Request, Response } from 'express';
import atestadoService from '../services/atestadoService';

export async function listAtestados(req: Request, res: Response, next: NextFunction) {
  try {
    const atestados = await atestadoService.list();
    return res.json(atestados);
  } catch (error) {
    next(error);
  }
}

export async function getAtestadoById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const atestado = await atestadoService.getById(id);
    return res.json(atestado);
  } catch (error) {
    next(error);
  }
}

export async function createAtestado(req: Request, res: Response, next: NextFunction) {
  try {
    const { id_colaborador, data_inicio, data_fim, arquivo, status } = req.body;

    if (!id_colaborador || !data_inicio || !data_fim) {
      return res.status(400).json({ message: 'id_colaborador, data_inicio e data_fim são obrigatórios.' });
    }

    const atestado = await atestadoService.create({
      id_colaborador: Number(id_colaborador),
      data_inicio,
      data_fim,
      arquivo,
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
