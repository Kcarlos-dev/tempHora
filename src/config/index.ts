import dotenv from 'dotenv';

dotenv.config();

const env = process.env;

const config = {
  server: {
    port: Number(env.PORT || 4000)
  },
  jwt: {
    secret: env.JWT_SECRET || 'change_this_secret',
    expiresIn: env.JWT_EXPIRES_IN || '1h'
  },
  mysql: {
    host: env.MYSQL_HOST || '127.0.0.1',
    port: Number(env.MYSQL_PORT || 3306),
    user: env.MYSQL_USER || 'root',
    password: env.MYSQL_PASSWORD || '',
    database: env.MYSQL_DATABASE || 'app_db'
  },
  redis: {
    host: env.REDIS_HOST || '127.0.0.1',
    port: Number(env.REDIS_PORT || 6379),
    password: env.REDIS_PASSWORD || undefined
  }
};

export default config;
