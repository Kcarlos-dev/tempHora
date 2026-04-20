import atestadoModel from '../models/atestadoModel';
import AppError from '../utils/AppError';

const ALLOWED_STATUS = ['pendente', 'aprovado', 'rejeitado'];

const atestadoService = {
  async list() {
    return atestadoModel.findAll();
  },

  async getByIdColaborador(id: number) {
    const atestado = await atestadoModel.findByIdColaborador(id);

    if (!atestado) {
      throw new AppError('Atestado não encontrado.', 404);
    }

    return atestado;
  },

  async getByCpfColaborador(id_empresa: number, cpf: string) {
    const atestado = await atestadoModel.findByCpf(id_empresa, cpf);

    if (!atestado || atestado.length === 0) {
      throw new AppError('Atestado não encontrado.', 404);
    }

    return atestado;
  },
  
  async getById(id: number) {
    const atestado = await atestadoModel.findById(id);

    if (!atestado) {
      throw new AppError('Atestado não encontrado.', 404);
    }

    return atestado;
  },

  // Garante que o atestado de `id` pertence à empresa `id_empresa`. Sem isso,
  // um admin da empresa A consegue passar o próprio id_empresa na URL e mexer
  // em um atestado cujo `:id` é de outra empresa (IDOR entre tenants).
  async assertBelongsToEmpresa(id: number, id_empresa: number) {
    const empresaDoAtestado = await atestadoModel.findEmpresaById(id);
    if (empresaDoAtestado === null) {
      throw new AppError('Atestado não encontrado.', 404);
    }
    if (empresaDoAtestado !== Number(id_empresa)) {
      throw new AppError('Atestado não pertence à empresa informada.', 403);
    }
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
    id_empresa: number,
    data: {
      id_colaborador: number;
      data_inicio: string;
      data_fim: string;
      arquivo?: string | null;
      status?: string;
    }
  ) {
    await this.assertBelongsToEmpresa(id, id_empresa);

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

  async remove(id: number, id_empresa: number) {
    await this.assertBelongsToEmpresa(id, id_empresa);
    await atestadoModel.remove(id);
  }
};

export default atestadoService;
