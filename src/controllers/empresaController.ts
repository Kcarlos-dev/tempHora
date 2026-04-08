import { NextFunction, Request, Response } from 'express';
import empresaService from '../services/empresaService';

export async function listEmpresas(req: Request, res: Response, next: NextFunction) {
  try {
    const empresas = await empresaService.list();
    return res.json(empresas);
  } catch (error) {
    next(error);
  }
}

export async function getEmpresaById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id_empresa);
    const empresa = await empresaService.getById(id);
    return res.json(empresa);
  } catch (error) {
    next(error);
  }
}

export async function createEmpresa(req: Request, res: Response, next: NextFunction) {
  try {
    const { enterprise, cnpj, email, phone } = req.body;

    if (!enterprise || !cnpj || !email) {
      return res.status(400).json({ message: 'enterprise, cnpj e email são obrigatórios.' });
    }

    const empresa = await empresaService.create({ enterprise, cnpj, email, phone });
    return res.status(201).json(empresa);
  } catch (error) {
    next(error);
  }
}

export async function updateEmpresa(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id_empresa);
    const { enterprise, cnpj, email, phone } = req.body;

    if (!enterprise || !cnpj || !email) {
      return res.status(400).json({ message: 'enterprise, cnpj e email são obrigatórios.' });
    }

    const empresa = await empresaService.update(id, { enterprise, cnpj, email, phone });
    return res.json(empresa);
  } catch (error) {
    next(error);
  }
}

export async function deleteEmpresa(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id_empresa);
    await empresaService.remove(id);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
}
