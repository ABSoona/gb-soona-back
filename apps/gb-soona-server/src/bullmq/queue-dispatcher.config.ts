
export const redisConnection = {
    host: process.env.REDIS_BROKER_HOST || 'redis_broker',
    port: parseInt(process.env.REDIS_BROKER_PORT || '6379'),
    retryStrategy: (times: number) => Math.min(times * 100, 2000),
  }