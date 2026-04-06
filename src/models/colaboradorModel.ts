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
}

const colaboradorModel = {
  async findAll(): Promise<ColaboradorRecord[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, id_empresa, id_user, full_name, cpf, phone, position, status FROM colaborador ORDER BY id DESC'
    );

    return rows as ColaboradorRecord[];
  },

  async findById(id: number): Promise<ColaboradorRecord | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, id_empresa, id_user, full_name, cpf, phone, position, status FROM colaborador WHERE id = ?',
      [id]
    );

    return rows.length ? (rows[0] as ColaboradorRecord) : null;
  },

  async create(data: Omit<ColaboradorRecord, 'id'>): Promise<ColaboradorRecord> {
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO colaborador
        (id_empresa, id_user, full_name, cpf, phone, position, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.id_empresa, data.id_user, data.full_name, data.cpf, data.phone, data.position, data.status]
    );

    const colaborador = await this.findById(result.insertId);

    if (!colaborador) {
      throw new Error('Falha ao recuperar colaborador criado.');
    }

    return colaborador;
  },

  async update(id: number, data: Omit<ColaboradorRecord, 'id'>): Promise<ColaboradorRecord | null> {
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

  async remove(id: number): Promise<void> {
    await pool.execute<ResultSetHeader>('DELETE FROM colaborador WHERE id = ?', [id]);
  }
};

export default colaboradorModel;
