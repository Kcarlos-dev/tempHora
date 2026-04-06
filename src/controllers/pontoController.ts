import { NextFunction, Request, Response } from 'express';
import pontoService from '../services/pontoService';

export async function listPontos(req: Request, res: Response, next: NextFunction) {
  try {
    const pontos = await pontoService.list();
    return res.json(pontos);
  } catch (error) {
    next(error);
  }
}

export async function getPontoById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const ponto = await pontoService.getById(id);
    return res.json(ponto);
  } catch (error) {
    next(error);
  }
}

export async function createPonto(req: Request, res: Response, next: NextFunction) {
  try {
    const { id_colaborador, tipo, data_hora, latitude, longitude, foto } = req.body;

    if (!id_colaborador || !tipo || !data_hora) {
      return res.status(400).json({ message: 'id_colaborador, tipo e data_hora são obrigatórios.' });
    }

    const ponto = await pontoService.create({
      id_colaborador: Number(id_colaborador),
      tipo,
      data_hora,
      latitude: latitude !== undefined ? Number(latitude) : null,
      longitude: longitude !== undefined ? Number(longitude) : null,
      foto
    });

    return res.status(201).json(ponto);
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

    return res.json(ponto);
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
