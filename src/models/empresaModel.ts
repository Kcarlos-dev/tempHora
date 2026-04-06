import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/database';

export interface EmpresaRecord {
  id: number;
  enterprise: string;
  cnpj: string;
  email: string;
  phone: string | null;
}

const empresaModel = {
  async findAll(): Promise<EmpresaRecord[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, enterprise, cnpj, email, phone FROM empresa ORDER BY id DESC'
    );

    return rows as EmpresaRecord[];
  },

  async findById(id: number): Promise<EmpresaRecord | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, enterprise, cnpj, email, phone FROM empresa WHERE id = ?',
      [id]
    );

    return rows.length ? (rows[0] as EmpresaRecord) : null;
  },

  async findByCnpj(cnpj: string): Promise<EmpresaRecord | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, enterprise, cnpj, email, phone FROM empresa WHERE cnpj = ?',
      [cnpj]
    );

    return rows.length ? (rows[0] as EmpresaRecord) : null;
  },

  async create(data: Omit<EmpresaRecord, 'id'>): Promise<EmpresaRecord> {
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO empresa (enterprise, cnpj, email, phone) VALUES (?, ?, ?, ?)',
      [data.enterprise, data.cnpj, data.email, data.phone]
    );

    const empresa = await this.findById(result.insertId);

    if (!empresa) {
      throw new Error('Falha ao recuperar empresa criada.');
    }

    return empresa;
  },

  async update(id: number, data: Omit<EmpresaRecord, 'id'>): Promise<EmpresaRecord | null> {
    await pool.execute<ResultSetHeader>(
      'UPDATE empresa SET enterprise = ?, cnpj = ?, email = ?, phone = ? WHERE id = ?',
      [data.enterprise, data.cnpj, data.email, data.phone, id]
    );

    return this.findById(id);
  },

  async remove(id: number): Promise<void> {
    await pool.execute<ResultSetHeader>('DELETE FROM empresa WHERE id = ?', [id]);
  }
};

export default empresaModel;
