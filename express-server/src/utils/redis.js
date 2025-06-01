// app/src/utils/redis.js
import Redis from 'ioredis';

export const Cache = new Redis({
  host: 'redis',      // Docker service name
  port: 6379          // Redis default internal port
});
