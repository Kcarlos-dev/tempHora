import { NextFunction, Request, Response } from 'express';
import colaboradorService from '../services/colaboradorService';

export async function listColaboradores(req: Request, res: Response, next: NextFunction) {
  try {
    const colaboradores = await colaboradorService.list();
    return res.json(colaboradores);
  } catch (error) {
    next(error);
  }
}

export async function getColaboradorById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const colaborador = await colaboradorService.getById(id);
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
