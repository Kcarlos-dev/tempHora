import pontoModel from '../models/pontoModel';
import AppError from '../utils/AppError';

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 200;

function normalizePagination(page?: number, pageSize?: number) {
  const safePage = Math.max(1, Math.trunc(Number(page)) || 1);
  const safePageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.trunc(Number(pageSize)) || DEFAULT_PAGE_SIZE),
  );
  const offset = (safePage - 1) * safePageSize;
  return { page: safePage, pageSize: safePageSize, offset };
}

function buildGoogleMapsLink(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): string {
  if (latitude == null || longitude == null) return '';
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return '';
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export type PontoCsvRow = {
  id_colaborador: number;
  cpf: string | null;
  full_name: string | null;
  position: string | null;
  tipo: string;
  data_hora: string;
  link_google_maps: string;
};

const pontoService = {
  async list() {
    return pontoModel.findAll();
  },

  async getCsvByIdColaborador(
    id: number,
    data_inicial: string,
    data_final: string,
  ): Promise<PontoCsvRow[]> {
    const pontos = await pontoModel.findByIdCsv(id, data_inicial, data_final);

    if (!pontos) {
      throw new AppError('Registro de ponto não encontrado.', 404);
    }

    return pontos.map((p) => ({
      id_colaborador: p.id_colaborador,
      cpf: p.cpf,
      full_name: p.full_name,
      position: p.position,
      tipo: p.tipo,
      data_hora: p.data_hora,
      link_google_maps: buildGoogleMapsLink(p.latitude, p.longitude),
    }));
  },

  // Paginação simples: pede `pageSize + 1` ao banco; se vier o extra, hasMore=true
  // (evita COUNT(*) custoso em tabelas grandes).
  async getByIdColaborador(id: number, page?: number, pageSize?: number) {
    const p = normalizePagination(page, pageSize);
    const rows = await pontoModel.findByIdColaborador(id, p.pageSize + 1, p.offset);
    const hasMore = rows.length > p.pageSize;
    const data = hasMore ? rows.slice(0, p.pageSize) : rows;
    return {
      data,
      page: p.page,
      pageSize: p.pageSize,
      hasMore,
    };
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

  // Garante que o ponto de `id` pertence à empresa `id_empresa`. Sem isso, um
  // admin da empresa A consegue passar o próprio id_empresa na URL e mexer em
  // um ponto cujo `:id` é de outra empresa (IDOR entre tenants).
  async assertBelongsToEmpresa(id: number, id_empresa: number) {
    const empresaDoPonto = await pontoModel.findEmpresaById(id);
    if (empresaDoPonto === null) {
      throw new AppError('Registro de ponto não encontrado.', 404);
    }
    if (empresaDoPonto !== Number(id_empresa)) {
      throw new AppError('Registro de ponto não pertence à empresa informada.', 403);
    }
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
    id_empresa: number,
    data: {
      id_colaborador: number;
      tipo: string;
      data_hora: string;
      latitude?: number | null;
      longitude?: number | null;
      foto?: string | null;
    }
  ) {
    await this.assertBelongsToEmpresa(id, id_empresa);

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

  async remove(id: number, id_empresa: number) {
    await this.assertBelongsToEmpresa(id, id_empresa);
    await pontoModel.remove(id);
  }
};

export default pontoService;
