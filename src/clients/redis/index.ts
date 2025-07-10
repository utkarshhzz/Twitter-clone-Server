import Redis from "ioredis"

export const redisClient = new Redis("redis://default:AYDAAAIjcDFmNzNkYjkyZGQ1ZTQ0NjhmODY2MDU1NWVhYWEwZmRhN3AxMA@cuddly-dodo-32960.upstash.io:6379", {
  tls: {
    rejectUnauthorized: false
  }
});
