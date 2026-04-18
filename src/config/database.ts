import mysql, { PoolOptions } from 'mysql2/promise';
import config from './index';

const poolOptions: PoolOptions = {
  host: config.mysql.host,
  port: config.mysql.port,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Retorna DATETIME/TIMESTAMP como string "YYYY-MM-DD HH:mm:ss" (sem conversão de fuso).
  // Assim, quem grava o horário local do Brasil recebe de volta o mesmo horário —
  // evita o shift de 3h quando o servidor roda em UTC e o Node interpretava a coluna.
  dateStrings: true,
  timezone: 'local',
};

if (config.mysql.ssl) {
  poolOptions.ssl = {
    rejectUnauthorized: config.mysql.sslRejectUnauthorized,
  };
}

const pool = mysql.createPool(poolOptions);

export default pool;
