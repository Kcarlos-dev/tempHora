import dotenv from 'dotenv';

dotenv.config();

const env = process.env;

if (!env.JWT_SECRET) {
  throw new Error(
    'FATAL: A variável de ambiente JWT_SECRET não foi definida. ' +
    'A aplicação não pode iniciar sem um segredo JWT seguro.'
  );
}

const VALID_EXPIRES_IN_PATTERN = /^\d+[smhd]$/;
if (env.JWT_EXPIRES_IN && !VALID_EXPIRES_IN_PATTERN.test(env.JWT_EXPIRES_IN)) {
  throw new Error(
    `FATAL: JWT_EXPIRES_IN inválido: "${env.JWT_EXPIRES_IN}". Use formatos como: 15m, 1h, 7d.`
  );
}

const config = {
  server: {
    port: Number(env.PORT || 4000)
  },
  jwt: {
    secret: env.JWT_SECRET,
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
  },
  cors: {
    allowedOrigins: env.ALLOWED_ORIGINS
      ? env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000']
  }
};

export default config;
