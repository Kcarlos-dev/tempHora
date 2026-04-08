import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcrypt';
import pool from '../config/database';

export interface UserRecord {
  id: number;
  id_user:number,
  id_empresa: number,
  id_colaborador:number,
  name: string;
  email: string;
  password_hash: string;
  role: string;
  status:string
}

const userModel = {
  async findByEmail(email: string): Promise<UserRecord | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id_user,id_empresa,id_colaborador,email,password_hash,role, status FROM vw_users_colaboradores WHERE 1 = 1 AND email = ?',
      [email]
    );

    return rows.length ? (rows[0] as UserRecord) : null;
  },

  async findById(id: number): Promise<UserRecord | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, name, email, password_hash, role FROM users WHERE id = ?',
      [id]
    );

    return rows.length ? (rows[0] as UserRecord) : null;
  },

  async create(data: { email: string; password: string; name: string; role: string }): Promise<UserRecord> {
    const passwordHash = await bcrypt.hash(data.password, 10);

    const [result] = await pool.execute<RowDataPacket[]>(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [data.name, data.email, passwordHash, data.role]
    );

    const insertedId = (result as any).insertId;
    const user = await userModel.findById(insertedId);

    if (!user) {
      throw new Error('Falha ao recuperar usuário criado');
    }

    return user;
  }
};

export default userModel;
