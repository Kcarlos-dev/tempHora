import colaboradorModel from '../models/colaboradorModel';
import AppError from '../utils/AppError';

const ALLOWED_STATUS = ['ativo', 'inativo'];

const colaboradorService = {
  async list(id_empresa:number) {
    return colaboradorModel.findAll(id_empresa);
  },

  async getByCpf(cpf:string) {
    const colaborador = await colaboradorModel.findByCpf(cpf);

    if (!colaborador) {
      throw new AppError('Colaborador não encontrado.', 404);
    }

    return colaborador;
  },
  
  async getById(id: number) {
    const colaborador = await colaboradorModel.findById(id);

    if (!colaborador) {
      throw new AppError('Colaborador não encontrado.', 404);
    }

    return colaborador;
  },

  async create(data: {
    id_empresa: number;
    id_user: number;
    full_name: string;
    cpf?: string | null;
    phone?: string | null;
    position?: string | null;
    status?: string;
  }) {
    return colaboradorModel.create({
      id_empresa: data.id_empresa,
      id_user: data.id_user,
      full_name: data.full_name,
      cpf: data.cpf ?? null,
      phone: data.phone ?? null,
      position: data.position ?? null,
      status: data.status ?? 'ativo',
      foto: null,
    });
  },

  async updateFoto(id: number, foto: string | null) {
    await this.getById(id);
    const updated = await colaboradorModel.updateFoto(id, foto);
    if (!updated) {
      throw new AppError('Colaborador não encontrado.', 404);
    }
    return updated;
  },

  async update(
    id: number,
    data: {
      id_empresa: number;
      id_user: number;
      full_name: string;
      cpf?: string | null;
      phone?: string | null;
      position?: string | null;
      status?: string;
    }
  ) {
    await this.getById(id);

    const updated = await colaboradorModel.update(id, {
      id_empresa: data.id_empresa,
      id_user: data.id_user,
      full_name: data.full_name,
      cpf: data.cpf ?? null,
      phone: data.phone ?? null,
      position: data.position ?? null,
      status: data.status ?? 'ativo'
    });

    if (!updated) {
      throw new AppError('Colaborador não encontrado.', 404);
    }

    return updated;
  },

  async updateStatus(id: number, status: string) {
    await this.getById(id);

    if (!ALLOWED_STATUS.includes(status)) {
      throw new AppError('Status inválido. Use "ativo" ou "inativo".', 400);
    }

    const updated = await colaboradorModel.updateStatus(id, status);

    if (!updated) {
      throw new AppError('Colaborador não encontrado.', 404);
    }

    return updated;
  }
};

export default colaboradorService;
