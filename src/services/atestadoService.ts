import atestadoModel from '../models/atestadoModel';
import AppError from '../utils/AppError';

const ALLOWED_STATUS = ['pendente', 'aprovado', 'rejeitado'];

const atestadoService = {
  async list() {
    return atestadoModel.findAll();
  },

  async getById(id: number) {
    const atestado = await atestadoModel.findById(id);

    if (!atestado) {
      throw new AppError('Atestado não encontrado.', 404);
    }

    return atestado;
  },

  async create(data: {
    id_colaborador: number;
    data_inicio: string;
    data_fim: string;
    arquivo?: string | null;
    status?: string;
  }) {
    const status = data.status ?? 'pendente';

    if (!ALLOWED_STATUS.includes(status)) {
      throw new AppError('Status inválido para atestado.', 400);
    }

    return atestadoModel.create({
      id_colaborador: data.id_colaborador,
      data_inicio: data.data_inicio,
      data_fim: data.data_fim,
      arquivo: data.arquivo ?? null,
      status
    });
  },

  async update(
    id: number,
    data: {
      id_colaborador: number;
      data_inicio: string;
      data_fim: string;
      arquivo?: string | null;
      status?: string;
    }
  ) {
    await this.getById(id);

    const status = data.status ?? 'pendente';

    if (!ALLOWED_STATUS.includes(status)) {
      throw new AppError('Status inválido para atestado.', 400);
    }

    const updated = await atestadoModel.update(id, {
      id_colaborador: data.id_colaborador,
      data_inicio: data.data_inicio,
      data_fim: data.data_fim,
      arquivo: data.arquivo ?? null,
      status
    });

    if (!updated) {
      throw new AppError('Atestado não encontrado.', 404);
    }

    return updated;
  },

  async remove(id: number) {
    await this.getById(id);
    await atestadoModel.remove(id);
  }
};

export default atestadoService;
