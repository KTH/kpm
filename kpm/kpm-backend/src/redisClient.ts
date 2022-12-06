import { createClient, RedisClientType } from "redis";

const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || "";
const useRedis = !!process.env.REDIS_HOST;

let redisClient: RedisClientType | undefined = undefined;

export function getRedisClient(): RedisClientType | undefined {
  if (useRedis) {
    if (redisClient) return redisClient;

    redisClient = createClient({
      socket: {
        port: REDIS_PORT,
        host: REDIS_HOST,
        tls: REDIS_PORT === 6380,
      },
      password: REDIS_PASSWORD,
      // Notes on legacy mode: https://github.com/tj/connect-redis/pull/337
      legacyMode: true,
    });
    redisClient.connect().catch((err) => {
      // TODO: Error handling (e.g. wrong password)
      throw err;
    });

    redisClient.on("error", (err) => {
      // TODO: Error handling
      throw err;
    });

    return redisClient;
  }
}
