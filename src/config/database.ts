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
};

if (config.mysql.ssl) {
  poolOptions.ssl = {
    rejectUnauthorized: config.mysql.sslRejectUnauthorized,
  };
}

const pool = mysql.createPool(poolOptions);

export default pool;
