import NodeCache from "node-cache";
import { getRedisClient, REDIS_DB_NAMES } from "../redisClient";
const hasRedis = !!process.env.REDIS_HOST;

/**
 * Code to CACHE Data
 */
// kopps_cache is a local cache of course_code -> kopps info object.
// Note that we don't cache the entire (much larger) kopps response,
// but only the fields we care about.
// https://github.com/node-cache/node-cache
// The standard ttl is given in seconds, I guess anything between 12
// and 48 hours should be ok, maybe avoid purging stuff at the same
// time every day by using 40 hours.
const KOPPS_CACHE_TTL_SECS = 40 * 3600;
const redisClient = hasRedis ? getRedisClient(REDIS_DB_NAMES.KOPPS) : null;
const kopps_cache = hasRedis
  ? null
  : new NodeCache({ stdTTL: KOPPS_CACHE_TTL_SECS, useClones: false });
type TCacheable = object | string;
export async function __CACHED_VALUE__<T extends TCacheable>(
  key: string,
  fn: () => Promise<T | undefined>
): Promise<T | undefined> {
  const cachedValue = _getCachedValue<T>(key);
  if (cachedValue) return cachedValue;

  const newValue = await fn();

  if (newValue) _setCachedValue(key, newValue);

  return newValue;
}

async function _setCachedValue<T extends TCacheable>(key: string, value: T) {
  if (hasRedis) {
    await redisClient?.set(key, JSON.stringify(value), {
      EX: KOPPS_CACHE_TTL_SECS,
    });
  } else {
    kopps_cache?.set(key, value);
  }
}

async function _getCachedValue<T extends TCacheable>(
  key: string
): Promise<T | undefined> {
  const cachedValue: T | string | null | undefined = hasRedis
    ? await redisClient?.get(key)
    : kopps_cache?.get<T>(key);

  if (cachedValue) {
    if (typeof cachedValue === "string") {
      return JSON.parse(cachedValue);
    } else {
      return cachedValue;
    }
  }
}
