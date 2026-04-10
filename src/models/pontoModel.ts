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

const pontoModel = {
  async findAll(): Promise<PontoRecord[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, id_colaborador, tipo, data_hora, latitude, longitude, foto FROM ponto ORDER BY data_hora DESC'
    );

    return rows as PontoRecord[];
  },

  async findByIdCsv(id:number): Promise<PontoRecord[]>{
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
      `,
      [id]
    );

    return rows as PontoRecord[];
  },

  async findByIdColaborador(id: number): Promise<PontoRecord[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, id_colaborador, tipo, data_hora, latitude, longitude, foto FROM ponto WHERE id_colaborador = ?',
      [id]
    );

    return rows as PontoRecord[];
  },

  async findById(id: number): Promise<PontoRecord | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, id_colaborador, tipo, data_hora, latitude, longitude, foto FROM ponto WHERE id = ?',
      [id]
    );

    return rows.length ? (rows[0] as PontoRecord) : null;
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
