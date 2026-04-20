import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/database';

export interface PontoRecord {
  id: number;
  id_colaborador: number;
  tipo: string;
  data_hora: string;
  latitude: number | null;
  longitude: number | null;
  foto: string | null;
}

export interface PontoEmpresaRecord extends PontoRecord {
  colaborador_nome: string | null;
  colaborador_cpf: string | null;
}

const pontoModel = {
  async findAll(): Promise<PontoRecord[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, id_colaborador, tipo, data_hora, latitude, longitude, foto FROM ponto ORDER BY data_hora DESC'
    );

    return rows as PontoRecord[];
  },

  async findByIdCsv(id:number,data_inicial:string, data_final:string): Promise<PontoRecord[]>{
    const [rows] = await pool.execute<RowDataPacket[]>(
      `
      select p.id_colaborador,
            c.cpf,
            c.full_name,
            c.position,
            p.tipo,
            p.latitude,
            p.longitude,
            p.data_hora
      from ponto p
      left join temphora.colaborador c on p.id_colaborador = c.id
      where id_colaborador = ?
      AND p.data_hora BETWEEN ? AND ?
      `,
      [id,data_inicial,data_final]
    );

    return rows as PontoRecord[];
  },

  async findByIdColaborador(
    id: number,
    limit: number,
    offset: number,
  ): Promise<PontoRecord[]> {
    const safeLimit = Math.max(1, Math.min(200, Math.trunc(limit)));
    const safeOffset = Math.max(0, Math.trunc(offset));
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, id_colaborador, tipo, data_hora, latitude, longitude, foto
         FROM ponto
         WHERE id_colaborador = ?
         ORDER BY data_hora DESC
         LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      [id]
    );

    return rows as PontoRecord[];
  },

  async countByEmpresa(id_empresa: number): Promise<number> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total
       FROM ponto p
       INNER JOIN colaborador c ON c.id = p.id_colaborador
       WHERE c.id_empresa = ?`,
      [id_empresa]
    );
    return Number((rows[0] as { total: number | string }).total ?? 0);
  },

  async findByEmpresaPaginated(
    id_empresa: number,
    limit: number,
    offset: number
  ): Promise<PontoEmpresaRecord[]> {
    const safeLimit = Math.max(1, Math.min(200, Math.trunc(limit)));
    const safeOffset = Math.max(0, Math.trunc(offset));
    // LIMIT/OFFSET inseridos como números (após saneamento) — MySQL não permite placeholders aqui com execute().
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT p.id,
              p.id_colaborador,
              p.tipo,
              p.data_hora,
              p.latitude,
              p.longitude,
              p.foto,
              c.full_name AS colaborador_nome,
              c.cpf       AS colaborador_cpf
         FROM ponto p
         INNER JOIN colaborador c ON c.id = p.id_colaborador
         WHERE c.id_empresa = ?
         ORDER BY p.data_hora DESC
         LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      [id_empresa]
    );

    return rows as PontoEmpresaRecord[];
  },

  async findById(id: number): Promise<PontoRecord | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, id_colaborador, tipo, data_hora, latitude, longitude, foto FROM ponto WHERE id = ?',
      [id]
    );

    return rows.length ? (rows[0] as PontoRecord) : null;
  },

  // Retorna o id_empresa ao qual um registro de ponto pertence (via colaborador).
  // Usado para impedir IDOR cross-tenant em update/delete pelo :id do ponto.
  async findEmpresaById(id: number): Promise<number | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT c.id_empresa
         FROM ponto p
         INNER JOIN colaborador c ON c.id = p.id_colaborador
         WHERE p.id = ?
         LIMIT 1`,
      [id]
    );
    if (!rows.length) return null;
    return Number(rows[0].id_empresa);
  },

  async create(data: Omit<PontoRecord, 'id'>): Promise<PontoRecord> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO ponto
        (id_colaborador, tipo, data_hora, latitude, longitude, foto)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.id_colaborador, data.tipo, data.data_hora, data.latitude, data.longitude, data.foto]
    );

    const ponto = await this.findById(result.insertId);

    if (!ponto) {
      throw new Error('Falha ao recuperar ponto criado.');
    }

    return ponto;
  },

  async update(id: number, data: Omit<PontoRecord, 'id'>): Promise<PontoRecord | null> {
    await pool.execute<ResultSetHeader>(
      `UPDATE ponto
       SET id_colaborador = ?, tipo = ?, data_hora = ?, latitude = ?, longitude = ?, foto = ?
       WHERE id = ?`,
      [data.id_colaborador, data.tipo, data.data_hora, data.latitude, data.longitude, data.foto, id]
    );

    return this.findById(id);
  },

  async remove(id: number): Promise<void> {
    await pool.execute<ResultSetHeader>('DELETE FROM ponto WHERE id = ?', [id]);
  }
};

export default pontoModel;
