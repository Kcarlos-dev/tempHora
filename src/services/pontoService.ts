import pontoModel from '../models/pontoModel';
import AppError from '../utils/AppError';



const pontoService = {
  async list() {
    return pontoModel.findAll();
  },

  async getCsvByIdColaborador(id:number,data_inicial:string, data_final:string){
    const ponto = await pontoModel.findByIdCsv(id,data_inicial, data_final)

    if (!ponto) {
      throw new AppError('Registro de ponto não encontrado.', 404);
    }
    
    return ponto;
  },

  async getByIdColaborador(id: number) {
    const ponto = await pontoModel.findByIdColaborador(id);

    if (!ponto) {
      throw new AppError('Registro de ponto não encontrado.', 404);
    }

    return ponto;
  },

  async listByEmpresa(id_empresa: number, page: number, pageSize: number) {
    const safePage = Math.max(1, Math.trunc(page) || 1);
    const safePageSize = Math.min(200, Math.max(1, Math.trunc(pageSize) || 20));
    const offset = (safePage - 1) * safePageSize;

    const [total, data] = await Promise.all([
      pontoModel.countByEmpresa(id_empresa),
      pontoModel.findByEmpresaPaginated(id_empresa, safePageSize, offset),
    ]);

    return {
      data,
      total,
      page: safePage,
      pageSize: safePageSize,
      totalPages: Math.max(1, Math.ceil(total / safePageSize)),
    };
  },

  async getById(id: number) {
    const ponto = await pontoModel.findById(id);

    if (!ponto) {
      throw new AppError('Registro de ponto não encontrado.', 404);
    }

    return ponto;
  },

  async create(data: {
    id_colaborador: number;
    tipo: string;
    data_hora: string;
    latitude?: number | null;
    longitude?: number | null;
    foto?: string | null;
  }) {

    return pontoModel.create({
      id_colaborador: data.id_colaborador,
      tipo: data.tipo,
      data_hora: data.data_hora,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      foto: data.foto ?? null
    });
  },

  async update(
    id: number,
    data: {
      id_colaborador: number;
      tipo: string;
      data_hora: string;
      latitude?: number | null;
      longitude?: number | null;
      foto?: string | null;
    }
  ) {
    await this.getById(id);


    const updated = await pontoModel.update(id, {
      id_colaborador: data.id_colaborador,
      tipo: data.tipo,
      data_hora: data.data_hora,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      foto: data.foto ?? null
    });

    if (!updated) {
      throw new AppError('Registro de ponto não encontrado.', 404);
    }

    return updated;
  },

  async remove(id: number) {
    await this.getById(id);
    await pontoModel.remove(id);
  }
};

export default pontoService;
