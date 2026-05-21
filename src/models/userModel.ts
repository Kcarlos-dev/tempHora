import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcrypt';
import pool from '../config/database';

export interface UserRecord {
  id: number;
  id_user: number;
  id_empresa: number | null;
  id_colaborador: number;
  name: string;
  full_name: string | null;
  cpf: string | null;
  email: string;
  password_hash: string;
  role: string;
  status: string;
  foto: string | null;
}

const VIEW_FIELDS =
  'id_user, id_empresa, id_colaborador, name, full_name, cpf, email, password_hash, role, status, foto';

const userModel = {
  async findByEmail(email: string): Promise<UserRecord | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${VIEW_FIELDS} FROM vw_users_colaboradores WHERE email = ?`,
      [email]
    );

    return rows.length ? (rows[0] as UserRecord) : null;
  },

  async findProfileByUserId(id_user: number): Promise<UserRecord | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT ${VIEW_FIELDS} FROM vw_users_colaboradores WHERE id_user = ?`,
      [id_user]
    );

    return rows.length ? (rows[0] as UserRecord) : null;
  },

  async findById(id: number): Promise<UserRecord | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, name, email, password_hash, role, id_empresa FROM users WHERE id = ?',
      [id]
    );

    return rows.length ? (rows[0] as UserRecord) : null;
  },

  async create(data: {
    email: string;
    password: string;
    name: string;
    role: string;
    id_empresa: number;
  }): Promise<UserRecord> {
    const passwordHash = await bcrypt.hash(data.password, 10);

    const [result] = await pool.execute<RowDataPacket[]>(
      'INSERT INTO users (name, email, password_hash, role, id_empresa) VALUES (?, ?, ?, ?, ?)',
      [data.name, data.email, passwordHash, data.role, data.id_empresa]
    );

    const insertedId = (result as any).insertId;
    const user = await userModel.findById(insertedId);

    if (!user) {
      throw new Error('Falha ao recuperar usuário criado');
    }

    return user;
  },

  async updatePassword(id_empresa: number, email: string, password: string) {
    const [resultUser] = await pool.execute<RowDataPacket[]>(
      'SELECT id_user, id_empresa from vw_users_colaboradores where id_empresa = ? and email = ?',
      [id_empresa, email]
    );
    if (resultUser.length === 0) {
      return null;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute<RowDataPacket[]>(
      'UPDATE users SET password_hash = ? WHERE  email = ?',
      [passwordHash, email]
    );
    return result;
  }
};

export default userModel;
