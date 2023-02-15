import assert from "node:assert/strict";
import { SessionData } from "express-session";
import NodeCache from "node-cache";
import { getRedisClient, REDIS_DB_NAMES } from "../redisClient";
import got from "got";

import { getFakeUserForDevelopment } from "../auth";
import {
  APICanvasRooms,
  APIMutedAuthErrType,
  TCourseCode,
  TLocalizedString,
  TSessionUser,
} from "kpm-backend-interface";
import { MutedAuthError } from "kpm-api-common/src/errors";

const CANVAS_API_TOKEN = process.env.CANVAS_API_TOKEN;
const KOPPS_API = "https://api.kth.se/api/kopps/v2";
const MY_CANVAS_ROOMS_API_URI =
  process.env.MY_CANVAS_ROOMS_API_URI ||
  "http://localhost:3001/kpm/canvas-rooms";
const SOCIAL_USER_API = process.env.SOCIAL_USER_URI;
const SOCIAL_KEY = process.env.SOCIAL_KEY;
const hasRedis = !!process.env.REDIS_HOST;

function optSessionUser(session: SessionData): TSessionUser | undefined {
  return session.user || getFakeUserForDevelopment();
}
export function sessionUser(session: SessionData): TSessionUser {
  // TODO: Throw AuthError
  const user = optSessionUser(session);
  assert(
    user !== undefined,
    new MutedAuthError<APIMutedAuthErrType>({
      type: "NoSessionUser",
      message: "Missing user object",
    })
  );
  assert(
    user?.kthid !== undefined,
    "User object missing required property kthid"
  );
  return user;
}

export async function getSocial<T>(
  user: TSessionUser,
  endpoint: string
): Promise<T> {
  return await got
    .get<T>(`${SOCIAL_USER_API}/${user.kthid}/${endpoint}.json`, {
      headers: {
        authorization: SOCIAL_KEY,
      },
      responseType: "json",
    })
    .then((r) => r.body);
}

export async function postSocial<T>(
  user: TSessionUser,
  endpoint: string,
  post_data: Record<string, any>
): Promise<T> {
  return await got
    .post<T>(`${SOCIAL_USER_API}/${user.kthid}/${endpoint}`, {
      headers: {
        authorization: SOCIAL_KEY,
      },
      responseType: "json",
      json: post_data,
    })
    .then((r) => r.body);
}

export async function get_canvas_rooms(user: string): Promise<APICanvasRooms> {
  const r = await got.get<APICanvasRooms>(
    `${MY_CANVAS_ROOMS_API_URI}/user/${user}`,
    {
      responseType: "json",
      headers: {
        authorization: `Bearer ${CANVAS_API_TOKEN}`,
      },
    }
  );
  return r.body;
}

/// This is the kopps info we cache, a middle ground between what we
/// get from kopps and what we want to deliver in the studies and
/// teaching enpoints.
export type TKoppsCourseInfo = {
  title: TLocalizedString;
  credits: number;
  creditUnitAbbr: TLocalizedString; // usually "hp", check other values!
  rounds: Record<string, TKoppsRoundInTerm[]>; // key is term as "YYYYT"
};

export type TCourseRound = {
  term: string; // TODO: Or year + termnumber?
  shortName?: string;
  ladokRoundId: string; // A one-digit number
  ladokUID: string; // A full uid
  firstTuitionDate: string; // "YYYY-MM-DD"
  lastTuitionDate: string; // "YYYY-MM-DD"
};

// This is the relevant parts of what we get from kopps courseroundterms endpoint.
type TKoppsCourseRoundTerms = {
  course: TKoppsCourseInfo;
  termsWithCourseRounds: TKoppsTermWithCourseRounds[];
};
type TKoppsTermWithCourseRounds = {
  term: string;
  rounds: TKoppsRoundInTerm[];
};
export type TKoppsRoundInTerm = {
  shortName?: string;
  ladokRoundId: string; // A one-digit number
  ladokUID: string; // A full uid
  firstTuitionDate: string; // "YYYY-MM-DD"
  lastTuitionDate: string; // "YYYY-MM-DD"
};

const __EMPTY_MATCH__: TKoppsCourseInfo = {
  title: { sv: "-", en: "-" },
  credits: 0,
  creditUnitAbbr: { sv: "-", en: "-" },
  rounds: {},
};

export async function getCourseInfo(
  course_code: TCourseCode
): Promise<TKoppsCourseInfo> {
  try {
    const val = await __CACHED_VALUE__<TKoppsCourseInfo>(
      course_code,
      async () => {
        // If there is a cache miss, we fetch the data from source
        const koppsData: TKoppsCourseRoundTerms | undefined = await got
          .get<TKoppsCourseRoundTerms>(
            `${KOPPS_API}/course/${course_code}/courseroundterms`,
            {
              responseType: "json",
            }
          )
          .then((r) => r.body);

        if (koppsData === undefined) {
          return undefined;
        }

        const { title, credits, creditUnitAbbr } = koppsData.course;

        const info: TKoppsCourseInfo = {
          title,
          credits,
          creditUnitAbbr,
          rounds: {},
        };

        for (let { term, rounds } of koppsData.termsWithCourseRounds) {
          // TODO: Shave off unused parts of rounds?
          info.rounds[term] = rounds;
        }

        return info;
      }
    );

    return val ?? __EMPTY_MATCH__;
  } catch (err: any) {
    // TODO: We should create EndpointError and let frontend handle fallback
    //  log.error(err, `Failed to get kopps data for ${course_code}`);

    // Ugly but type-correct fallback, so things don't crash.
    // This is not cached!  Or should we cache it for a few minutes to
    // give kopps a chance to start if it's broken?
    return __EMPTY_MATCH__;
  }
}

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

async function __CACHED_VALUE__<T extends TCacheable>(
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
