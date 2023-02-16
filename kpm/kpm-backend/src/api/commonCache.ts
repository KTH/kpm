import NodeCache from "node-cache";
import { RedisClientType } from "redis";
import { getRedisClient, REDIS_DB_NAMES } from "../redisClient";
const hasRedis = !!process.env.REDIS_HOST;

type TCacheable = object | string | null;

const redisClientInstances: Record<number, RedisClientType> = {};
const nodeCacheInstances: Record<number, NodeCache> = {};

/**
 * Allow memoizing values with string as lookup key. Stores cached
 * values in Redis if env var REDIS_HOST is set, otherwise uses
 * in memory storage NodeCache.
 */
export class StringKeyCache {
  _dbName: number;
  _ttlSecs: number;
  _isRedis?: boolean;
  _redisClient: RedisClientType | undefined;
  _nodeCache: NodeCache | undefined;

  /**
   * Create a key/val cache to memoize expensive calls.
   * @param dbName Choose one of enum REDIS_DB_NAMES
   * @param ttlSecs TTL in seconds
   */
  constructor(dbName: number, ttlSecs: number) {
    this._dbName = dbName;
    this._ttlSecs = ttlSecs;
    this._isRedis = hasRedis;

    if (hasRedis) {
      if (redisClientInstances[dbName] === undefined) {
        const tmp = getRedisClient(dbName);
        if (tmp !== undefined) {
          redisClientInstances[dbName] = tmp;
        }
      }
      this._redisClient = redisClientInstances[dbName];
    }

    // Fall back to NodeCache in memory cache
    if (this._redisClient === undefined) {
      if (nodeCacheInstances[dbName] === undefined) {
        nodeCacheInstances[dbName] = new NodeCache({ useClones: false });
      }
      this._nodeCache = nodeCacheInstances[dbName];
    }
  }

  async cache<T extends TCacheable>(
    key: string,
    fn: () => Promise<T | null | undefined>
  ): Promise<T | null | undefined> {
    const cachedValue = await this._getCachedValue<T>(key);
    if (cachedValue !== undefined) return cachedValue;

    // Cache miss, calculate value, store and return
    const newValue = await fn();
    if (newValue !== undefined) this._setCachedValue(key, newValue);
    return newValue;
  }

  async _setCachedValue<T extends TCacheable>(key: string, value: T) {
    if (this._isRedis) {
      return await this._redisClient?.set(key, JSON.stringify(value), {
        EX: this._ttlSecs,
      });
    }

    this._nodeCache?.set(key, value, this._ttlSecs);
  }

  async _getCachedValue<T extends TCacheable>(
    key: string
  ): Promise<T | null | undefined> {
    if (this._isRedis) {
      const tmp = await this._redisClient?.get(key);
      return typeof tmp === "string" ? JSON.parse(tmp) : tmp;
    }
    return this._nodeCache?.get<T>(key);
  }
}
