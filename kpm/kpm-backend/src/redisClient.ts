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

export enum REDIS_DB_NAMES {
  SESSION = 0,
  KOPPS = 1,
}

export function getRedisClient(
  databaseName = REDIS_DB_NAMES.SESSION
): RedisClientType | undefined {
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
      database: databaseName, // We use the db for session (0) and kopps cache (1)
      // Notes on legacy mode: https://github.com/tj/connect-redis/pull/337
      legacyMode: true,
    });
    redisClient.connect().catch((err) => {
      log.error(err, "Redis client connection error");
    });

    redisClient.on("reconnecting", () => {
      log.info("Redis client reconnecting");
    });

    redisClient.on("ready", () => {
      log.info("Redis client ready to go!");
    });

    redisClient.on("error", (err) => {
      if (err instanceof SocketClosedUnexpectedlyError) {
        log.info("Redis closed unexpectedly. It will reconnect");
        return;
      }
      // Rethrowing errors here can cause redis-client v4 to give up on life
      // https://github.com/redis/node-reedis/issues/2032
      log.error(err, `Redis client error: ${err?.name}`);
    });

    return redisClient;
  }
}
