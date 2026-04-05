import { createClient } from 'redis';
import config from './index';

const client = createClient({
  socket: {
    host: config.redis.host,
    port: config.redis.port
  },
  password: config.redis.password
});

client.on('error', err => {
  console.error('Redis Client Error', err);
});

export async function connectCache() {
  if (!client.isOpen) {
    await client.connect();
  }
}

export default client;
