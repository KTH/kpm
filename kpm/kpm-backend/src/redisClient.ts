import {
  createClient,
  RedisClientType,
  SocketClosedUnexpectedlyError,
} from "redis";
import log from "skog";

const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || "";
const REDIS_CONNECT_TIMEOUT = parseInt(
  process.env.REDIS_CONNECT_TIMEOUT || "5000"
);
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
        reconnectStrategy(retries) {
          // How many ms to wait until reconnect
          return Math.min(retries * 100, 1000);
        },
        connectTimeout: REDIS_CONNECT_TIMEOUT,
      },
      password: REDIS_PASSWORD,
      // Notes on legacy mode: https://github.com/tj/connect-redis/pull/337
      legacyMode: true,
    });
    redisClient.connect().catch((err) => {
      log.error({ message: "Redis client connection error", err });
    });

    redisClient.on("reconnecting", () => {
      log.info({ message: "Redis client reconnecting" });
    });

    redisClient.on("ready", () => {
      log.info({ message: "Redis client ready to go!" });
    });

    redisClient.on("error", (err) => {
      if (err?.name === "SocketClosedUnexpectedlyError") {
        log.info("Redis closed unexpectedly. It will reconnect");
        return;
      }
      // Rethrowing errors here can cause redis-client v4 to give up on life
      // https://github.com/redis/node-redis/issues/2032
      log.error({ message: "Redis client error", err });
    });

    return redisClient;
  }
}
