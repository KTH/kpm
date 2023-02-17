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

/**
 * Fetch a node-redis Client compatible with connect-redis. Uses node-redis v4
 * because connect-redis requires legacy v3 support at the moment.
 * @param databaseName
 * @returns RedisClientType
 */
export function getRedisClientForConnect(databaseName: REDIS_DB_NAMES) {
  // connect-redis currently only supports v3 of Redis
  // so it is compatible with ioredis. If this changes
  // you can get the v4 Redis client by skipping legacy
  // mode. https://github.com/tj/connect-redis/pull/337
  return _getRedisClient(databaseName, true);
}

/**
 * Fetch a general Redis Client with promise support. Uses node-redis v4.
 * @param databaseName
 * @returns RedisClientType
 */
export function getRedisClient(databaseName: REDIS_DB_NAMES) {
  // Return the v4 node-redis client
  return _getRedisClient(databaseName, false);
}

function _getRedisClient(
  databaseName: REDIS_DB_NAMES,
  legacyMode: boolean
): RedisClientType | undefined {
  if (useRedis) {
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
      legacyMode,
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
