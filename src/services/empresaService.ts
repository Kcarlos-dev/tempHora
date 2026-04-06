import empresaModel from '../models/empresaModel';
import AppError from '../utils/AppError';

const empresaService = {
  async list() {
    return empresaModel.findAll();
  },

  async getById(id: number) {
    const empresa = await empresaModel.findById(id);

    if (!empresa) {
      throw new AppError('Empresa não encontrada.', 404);
    }

    return empresa;
  },

  async create(data: { enterprise: string; cnpj: string; email: string; phone?: string | null }) {
    const existing = await empresaModel.findByCnpj(data.cnpj);

    if (existing) {
      throw new AppError('Já existe uma empresa com este CNPJ.', 409);
    }

    return empresaModel.create({
      enterprise: data.enterprise,
      cnpj: data.cnpj,
      email: data.email,
      phone: data.phone ?? null
    });
  },

  async update(id: number, data: { enterprise: string; cnpj: string; email: string; phone?: string | null }) {
    await this.getById(id);

    const existing = await empresaModel.findByCnpj(data.cnpj);

    if (existing && existing.id !== id) {
      throw new AppError('Já existe uma empresa com este CNPJ.', 409);
    }

    const updated = await empresaModel.update(id, {
      enterprise: data.enterprise,
      cnpj: data.cnpj,
      email: data.email,
      phone: data.phone ?? null
    });

    if (!updated) {
      throw new AppError('Empresa não encontrada.', 404);
    }

    return updated;
  },

  async remove(id: number) {
    await this.getById(id);
    await empresaModel.remove(id);
  }
};

export default empresaService;
