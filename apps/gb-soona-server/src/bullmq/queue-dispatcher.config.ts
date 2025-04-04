
export const redisConnection = {
    host: process.env.REDIS_BROKER_HOST || 'localhost',
    port: parseInt(process.env.REDIS_BROKER_PORT || '6379'),
  }