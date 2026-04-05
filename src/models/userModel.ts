import { RowDataPacket } from 'mysql2';
import pool from '../config/database';

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: string;
}

const userModel = {
  async findByEmail(email: string): Promise<UserRecord | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = ?',
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
  }
};

export default userModel;
