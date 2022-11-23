import assert from "node:assert";
import { SessionData } from "express-session";
import NodeCache from "node-cache";
import got from "got";

import { TSessionUser, getFakeUserForDevelopment } from "../auth";
import { APICanvasRooms, TCourseCode } from "kpm-backend-interface";

const CANVAS_API_TOKEN = process.env.CANVAS_API_TOKEN;
const KOPPS_API = "https://api.kth.se/api/kopps/v2";
const MY_CANVAS_ROOMS_API_URI =
  process.env.MY_CANVAS_ROOMS_API_URI ||
  "http://localhost:3001/kpm/canvas-rooms";
const SOCIAL_USER_API = process.env.SOCIAL_USER_URI;
const SOCIAL_KEY = process.env.SOCIAL_KEY;

function optSessionUser(session: SessionData): TSessionUser | undefined {
  return session.user || getFakeUserForDevelopment();
}
export function sessionUser(session: SessionData): TSessionUser {
  // TODO: Throw AuthError
  const user = optSessionUser(session);
  assert(user !== undefined, "Mising user object");
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

// kopps_cache is a local cache of course_code -> kopps info object.
// Note that we don't cache the entire (much larger) kopps response,
// but only the fields we care about.
// https://github.com/node-cache/node-cache
// The standard ttl is given in seconds, I guess anything between 12
// and 48 hours should be ok, maybe avoid purging stuff at the same
// time every day by using 40 hours.
const kopps_cache = new NodeCache({ stdTTL: 40 * 3600, useClones: false });

export type TKoppsCourseInfo = {
  title: { sv: string; en: string };
  credits: number;
  creditUnitAbbr: string; // usually "hp", check other values!
};

export async function getCourseInfo(
  course_code: TCourseCode
): Promise<TKoppsCourseInfo> {
  try {
    const result = kopps_cache.get<TKoppsCourseInfo>(course_code);
    if (result) {
      return result;
    }
    const { title, credits, creditUnitAbbr } = await got
      .get<TKoppsCourseInfo>(`${KOPPS_API}/course/${course_code}`, {
        responseType: "json",
      })
      .then((r) => r.body);
    const info = { title, credits, creditUnitAbbr };
    kopps_cache.set(course_code, info);
    return info;
  } catch (err: any) {
    // TODO: We should create EndpointError and let frontend handle fallback
    //  log.error(err, `Failed to get kopps data for ${course_code}`);

    // Ugly but type-correct fallback, so things don't crash.
    // This is not cached!  Or should we cache it for a few minutes to
    // give kopps a chance to start if it's broken?
    return { title: { sv: "-", en: "-" }, credits: 0, creditUnitAbbr: "-" };
  }
}
