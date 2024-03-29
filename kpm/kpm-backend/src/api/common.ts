import assert from "node:assert/strict";
import { SessionData } from "express-session";
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
import { memoized } from "./commonCache";
import { REDIS_DB_NAMES } from "../redisClient";
import log from "skog";

const CANVAS_API_TOKEN = process.env.CANVAS_API_TOKEN;
const KOPPS_API = process.env.KOPPS_API || "https://api.kth.se/api/kopps/v2";
const MY_CANVAS_ROOMS_API_URI =
  process.env.MY_CANVAS_ROOMS_API_URI ||
  "http://localhost:3001/kpm/canvas-rooms";
const SOCIAL_USER_API = process.env.SOCIAL_USER_URI;
const SOCIAL_KEY = process.env.SOCIAL_KEY;
const KOPPS_CACHE_TTL_SECS = 40 * 3600;

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
  endpoint: string,
  language: string | undefined
): Promise<T> {
  return await got
    .get<T>(`${SOCIAL_USER_API}/${user.kthid}/${endpoint}.json`, {
      headers: {
        authorization: SOCIAL_KEY,
        "Accept-Language": language || "en",
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
  state: "ESTABLISHED" | "DEACTIVATED" | "CANCELLED";
  rounds: Record<string, TKoppsRoundInTerm[]>; // key is term as "YYYYT"
};

// This is the relevant parts of what we get from kopps courseroundterms endpoint.
type TKoppsCourseRoundTerms = {
  course: TKoppsCourseData;
  termsWithCourseRounds: TKoppsTermWithCourseRounds[];
};
type TKoppsCourseData = {
  title: TLocalizedString;
  credits: number;
  creditUnitAbbr: TLocalizedString; // usually "hp", check other values!
  state: string; // Should be "ESTABLISHED" | "DEACTIVATED" | "CANCELLED";
};
type TKoppsTermWithCourseRounds = {
  term: string;
  rounds: TKoppsRoundInTerm[];
};
export type TKoppsRoundInTerm = {
  shortName?: string;
  ladokRoundId: string; // A one-digit number
  applicationCode: string; // A five-digit number
  ladokUID: string; // A full uid
  firstTuitionDate: string; // "YYYY-MM-DD"
  lastTuitionDate: string; // "YYYY-MM-DD"
};

const __EMPTY_MATCH__: TKoppsCourseInfo = {
  title: { sv: "-", en: "-" },
  credits: 0,
  creditUnitAbbr: { sv: "-", en: "-" },
  rounds: {},
  state: "ESTABLISHED",
};

export const getCourseInfo = memoized<TKoppsCourseInfo>({
  dbName: REDIS_DB_NAMES.KOPPS,
  ttlSecs: KOPPS_CACHE_TTL_SECS,
  fallbackValue: __EMPTY_MATCH__,
  async fn(course_code: string) {
    // If there is a cache miss, we fetch the data from source
    const url = `${KOPPS_API}/course/${course_code}/courseroundterms`;
    const koppsData: TKoppsCourseRoundTerms | undefined = await got
      .get<TKoppsCourseRoundTerms>(url, {
        responseType: "json",
      })
      .then((r) =>
        r.statusCode >= 200 && r.statusCode < 300 ? r.body : undefined
      );

    if (koppsData === undefined || koppsData === null) {
      return undefined;
    }

    const { title, credits, creditUnitAbbr, state } = koppsData.course;

    const info: TKoppsCourseInfo = {
      title,
      credits,
      creditUnitAbbr,
      state: checkState(state, course_code, url),
      rounds: {},
    };

    for (let { term, rounds } of koppsData.termsWithCourseRounds) {
      // TODO: Shave off unused parts of rounds?
      info.rounds[term] = rounds;
    }

    return info;
  },
});

function checkState(state: string, course_code: string, url: string) {
  if (
    state === "ESTABLISHED" ||
    state === "DEACTIVATED" ||
    state === "CANCELLED"
  ) {
    return state;
  }

  /// This is not really a problem, I just want to use the
  /// notifications to collect the possible states.
  log.error(
    { course_code, state, url },
    "Unexepected course state (assuming ESTABLISHED)"
  );
  return "ESTABLISHED";
}
