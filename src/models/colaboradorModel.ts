import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/database';

export interface ColaboradorRecord {
  id: number;
  id_empresa: number;
  id_user: number;
  full_name: string;
  cpf: string | null;
  phone: string | null;
  position: string | null;
  status: string;
  foto: string | null;
}

const BASE_FIELDS =
  'id, id_empresa, id_user, full_name, cpf, phone, position, status, foto';

const colaboradorModel = {
  // Listagem paginada. `limit` e `offset` já vêm sanitizados pelo service.
  // Pedimos `limit + 1` para detectar hasMore sem precisar de COUNT(*).
  async findAll(
    id_empresa: number,
    limit: number,
    offset: number,
  ): Promise<ColaboradorRecord[]> {
    const safeLimit = Math.max(1, Math.min(200, Math.trunc(limit)));
    const safeOffset = Math.max(0, Math.trunc(offset));
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ${BASE_FIELDS}
         FROM colaborador
         WHERE id_empresa = ?
         ORDER BY id DESC
         LIMIT ${safeLimit} OFFSET ${safeOffset}`,
      [id_empresa]
    );

    return rows as ColaboradorRecord[];
  },

  async findById(id: number): Promise<ColaboradorRecord | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${BASE_FIELDS} FROM colaborador WHERE id = ?`,
      [id]
    );

    return rows.length ? (rows[0] as ColaboradorRecord) : null;
  },

  async findByCpf(cpf: string): Promise<ColaboradorRecord | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${BASE_FIELDS} FROM colaborador WHERE cpf = ?`,
      [cpf]
    );

    return rows.length ? (rows[0] as ColaboradorRecord) : null;
  },

  async create(data: Omit<ColaboradorRecord, 'id' | 'foto'> & { foto?: string | null }): Promise<ColaboradorRecord> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO colaborador
        (id_empresa, id_user, full_name, cpf, phone, position, status, foto)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id_empresa,
        data.id_user,
        data.full_name,
        data.cpf,
        data.phone,
        data.position,
        data.status,
        data.foto ?? null,
      ]
    );

    const colaborador = await this.findById(result.insertId);

    if (!colaborador) {
      throw new Error('Falha ao recuperar colaborador criado.');
    }

    return colaborador;
  },

  async update(
    id: number,
    data: Omit<ColaboradorRecord, 'id' | 'foto'>
  ): Promise<ColaboradorRecord | null> {
    // A foto é atualizada por fluxo próprio (updateFoto) — mantemos aqui os
    // campos de cadastro e preservamos o `foto` já persistido no banco.
    await pool.execute<ResultSetHeader>(
      `UPDATE colaborador
       SET id_empresa = ?, id_user = ?, full_name = ?, cpf = ?, phone = ?, position = ?, status = ?
       WHERE id = ?`,
      [data.id_empresa, data.id_user, data.full_name, data.cpf, data.phone, data.position, data.status, id]
    );

    return this.findById(id);
  },

  async updateStatus(id: number, status: string): Promise<ColaboradorRecord | null> {
    await pool.execute<ResultSetHeader>('UPDATE colaborador SET status = ? WHERE id = ?', [status, id]);
    return this.findById(id);
  },

  async updateFoto(id: number, foto: string | null): Promise<ColaboradorRecord | null> {
    await pool.execute<ResultSetHeader>('UPDATE colaborador SET foto = ? WHERE id = ?', [foto, id]);
    return this.findById(id);
  },

  async remove(id: number): Promise<void> {
    await pool.execute<ResultSetHeader>('DELETE FROM colaborador WHERE id = ?', [id]);
  }
};

export default colaboradorModel;
