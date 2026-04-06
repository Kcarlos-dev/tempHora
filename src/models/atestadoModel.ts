import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/database';

export interface AtestadoRecord {
  id: number;
  id_colaborador: number;
  data_inicio: string;
  data_fim: string;
  arquivo: string | null;
  status: string;
}

const atestadoModel = {
  async findAll(): Promise<AtestadoRecord[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, id_colaborador, data_inicio, data_fim, arquivo, status FROM atestados ORDER BY data_inicio DESC'
    );

    return rows as AtestadoRecord[];
  },

  async findById(id: number): Promise<AtestadoRecord | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, id_colaborador, data_inicio, data_fim, arquivo, status FROM atestados WHERE id = ?',
      [id]
    );

    return rows.length ? (rows[0] as AtestadoRecord) : null;
  },

  async create(data: Omit<AtestadoRecord, 'id'>): Promise<AtestadoRecord> {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO atestados (id_colaborador, data_inicio, data_fim, arquivo, status) VALUES (?, ?, ?, ?, ?)',
      [data.id_colaborador, data.data_inicio, data.data_fim, data.arquivo, data.status]
    );

    const atestado = await this.findById(result.insertId);

    if (!atestado) {
      throw new Error('Falha ao recuperar atestado criado.');
    }

    return atestado;
  },

  async update(id: number, data: Omit<AtestadoRecord, 'id'>): Promise<AtestadoRecord | null> {
    await pool.execute<ResultSetHeader>(
      'UPDATE atestados SET id_colaborador = ?, data_inicio = ?, data_fim = ?, arquivo = ?, status = ? WHERE id = ?',
      [data.id_colaborador, data.data_inicio, data.data_fim, data.arquivo, data.status, id]
    );

    return this.findById(id);
  },

  async remove(id: number): Promise<void> {
    await pool.execute<ResultSetHeader>('DELETE FROM atestados WHERE id = ?', [id]);
  }
};

export default atestadoModel;
