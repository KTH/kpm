import NodeCache from "node-cache";
import { RedisClientType } from "redis";
import log from "skog-pino";
import { getRedisClient, REDIS_DB_NAMES } from "../redisClient";
const hasRedis = !!process.env.REDIS_HOST;

type TCacheable = object | string;

type TStringKeyCacheProps<T extends TCacheable> = {
  dbName: number;
  ttlSecs: number;
  fallbackValue: T | undefined;
  fn: (key: string) => Promise<T | undefined>;
};

const redisClientInstances: Record<number, RedisClientType> = {};
const nodeCacheInstances: Record<number, NodeCache> = {};

/**
 * Allow memoizing values with string as lookup key. Stores cached
 * values in Redis if env var REDIS_HOST is set, otherwise uses
 * in memory storage NodeCache.
 */
/**
 * Create a key/val cache to memoize expensive calls.
 * @param dbName Choose one of enum REDIS_DB_NAMES
 * @param ttlSecs TTL in seconds
 * @param fallbackValue a value to return if we don't get a result
 * @param fn async function to create a new value on cache miss
 */
export function memoized<T extends TCacheable>({
  dbName,
  ttlSecs,
  fallbackValue = undefined,
  fn,
}: TStringKeyCacheProps<T>) {
  let redisClient: RedisClientType | undefined;
  let nodeCache: NodeCache | undefined;

  // Initialize
  if (hasRedis) {
    if (redisClientInstances[dbName] === undefined) {
      const tmp = getRedisClient(dbName);
      if (tmp !== undefined) {
        redisClientInstances[dbName] = tmp;
      }
    }
    redisClient = redisClientInstances[dbName];
  }

  // Fall back to NodeCache in memory cache
  if (redisClient === undefined) {
    if (nodeCacheInstances[dbName] === undefined) {
      nodeCacheInstances[dbName] = new NodeCache({ useClones: false });
    }
    nodeCache = nodeCacheInstances[dbName];
  }

  // The getter function
  return async (key: string): Promise<T | undefined> => {
    const cachedValue = await _getCachedValue<T>(key, redisClient, nodeCache);
    if (cachedValue !== undefined && cachedValue !== null) return cachedValue;

    // Cache miss, calculate value, store and return
    let newValue: T | undefined;
    try {
      newValue = await fn(key);
    } catch (err: any) {
      Error.captureStackTrace(err);
      log.error(err, "Missing error handling in memoized function");
    }
    if (newValue !== undefined)
      _setCachedValue<T>(key, newValue, ttlSecs, redisClient, nodeCache);
    return newValue ?? fallbackValue;
  };
}

async function _setCachedValue<T extends TCacheable>(
  key: string,
  value: T,
  ttlSecs: number,
  redisClient: RedisClientType | undefined,
  nodeCache: NodeCache | undefined
) {
  if (redisClient !== undefined) {
    return await redisClient?.set(key, JSON.stringify(value), {
      EX: ttlSecs,
    });
  }

  nodeCache?.set(key, value, ttlSecs);
}

async function _getCachedValue<T>(
  key: string,
  redisClient: RedisClientType | undefined,
  nodeCache: NodeCache | undefined
): Promise<T | undefined> {
  if (redisClient !== undefined) {
    const tmp = await redisClient?.get(key);
    return typeof tmp === "string" ? JSON.parse(tmp) : tmp;
  }
  return nodeCache?.get<T>(key);
}
