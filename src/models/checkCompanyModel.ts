import { RowDataPacket } from 'mysql2';
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
      },

    /**
     * Retorna o `id_empresa` de um colaborador pelo seu `id`.
     * Usado pelo middleware para garantir que o colaborador alvo da requisição
     * realmente pertence à empresa do token — previne IDOR entre empresas.
     */
    async findEmpresaByColaboradorId(idColaborador: number) {
        const [rows] = await pool.execute<RowDataPacket[]>(
          'SELECT id_empresa FROM colaborador WHERE id = ? LIMIT 1',
          [idColaborador]
        );
        if (!rows.length) {
          return null;
        }
        return Number(rows[0].id_empresa);
      }
}
export default checkCompanyModel;