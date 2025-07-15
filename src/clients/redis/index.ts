import Redis from "ioredis"
import * as dotenv from "dotenv";

dotenv.config();

// Create a mock client for development when Redis is not available
const mockRedisClient = {
  get: async () => null,
  set: async () => "OK",
  del: async () => 1,
  setex: async () => "OK"
};

// Create Redis client with error handling
let actualRedisClient: Redis | null = null;

try {
  if (process.env.REDIS_URL && process.env.REDIS_URL !== "redis://localhost:6379") {
    actualRedisClient = new Redis(process.env.REDIS_URL, {
      tls: {
        rejectUnauthorized: false
      },
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });
  } else {
    console.log("Redis not configured or running locally - caching disabled");
  }
} catch (error) {
  console.error("Redis connection failed, caching disabled:", error);
  actualRedisClient = null;
}

export const redisClient = actualRedisClient || mockRedisClient as any;
