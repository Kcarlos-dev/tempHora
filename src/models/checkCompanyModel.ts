import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/database';


const checkCompanyModel = {
    async findById(id: number) {
        const [rows] = await pool.execute<RowDataPacket[]>(
          'SELECT id_empresa FROM colaborador WHERE id_user = ? LIMIT 1',
          [id]
        );
        if (!rows.length) {
          return null;
        }
        return rows[0].id_empresa as number;
      }
}
export default checkCompanyModel;