import { ResultSetHeader, RowDataPacket } from 'mysql2';
import pool from '../config/database';


const checkCompanyModel = {
    async findById(id: number) {
        const [rows] = await pool.execute<RowDataPacket[]>(
          'SELECT id_empresa FROM colaborador WHERE id_user = ? LIMIT 1',
          [id]
        );
      
        return rows[0]["id_empresa"];
      }
}
export default checkCompanyModel;