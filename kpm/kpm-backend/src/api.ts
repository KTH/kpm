import express, { Response } from "express";
import assert from "node:assert";
import got from "got";
import NodeCache from "node-cache";
import log from "skog";
import {
  APIStudies,
  APITeaching,
  APICanvasRooms,
  TTeachingCourse,
  TTeachingRole,
  TCourseCode,
  TStudiesCourse,
  TProgramCode,
} from "kpm-backend-interface";
import { TSessionUser, getFakeUserForDevelopment } from "./auth";

const MY_CANVAS_ROOMS_API_URI =
  process.env.MY_CANVAS_ROOMS_API_URI ||
  "http://localhost:3001/kpm/canvas-rooms";
const MY_TEACHING_API_URI =
  process.env.MY_TEACHING_API_URI || "http://localhost:3002/kpm/teaching";
const MY_STUDIES_API_URI =
  process.env.MY_STUDIES_API_URI || "http://localhost:3003/kpm/studies";
const CANVAS_API_TOKEN = process.env.CANVAS_API_TOKEN;
const KOPPS_API = "https://api.kth.se/api/kopps/v2";

export const api = express.Router();

// TODO: Add session handling

api.get("/", (req, res) => {
  return res.send({
    msg: "ok",
  });
});

api.get("/canvas-rooms", async (req, res: Response<APICanvasRooms>, next) => {
  try {
    const user = req.session.user || getFakeUserForDevelopment();
    assert(user !== undefined, "Mising user object");
    assert(
      user?.kthid !== undefined,
      "User object missing required property kthid"
    );

    const { rooms } = await get_canvas_rooms(user.kthid);
    res.send({ rooms });
  } catch (err) {
    next(err);
  }
});

api.get("/teaching", async (req, res: Response<APITeaching>, next) => {
  try {
    const user: TSessionUser = req.session.user! || getFakeUserForDevelopment();
    assert(user !== undefined, "Mising user object");
    assert(
      user?.kthid !== undefined,
      "User object missing required property kthid"
    );

    const perf1 = Date.now();
    const elapsed_ms = () => Date.now() - perf1;
    const teaching_fut = got
      .get<Record<TCourseCode, TTeachingRole[]>>(
        `${MY_TEACHING_API_URI}/user/${user.kthid}`,
        {
          responseType: "json",
        }
      )
      .then((r) => r.body);

    const rooms_fut = get_canvas_rooms(user.kthid);
    log.info({ elapsed_ms: elapsed_ms() }, "Initialized my-canvas-rooms-api");

    const teaching = await teaching_fut;
    log.info({ elapsed_ms: elapsed_ms() }, "Resolved my-teaching-api");

    const kopps_futs = Object.assign(
      {},
      ...Object.keys(teaching).map((course_code) => ({
        [course_code]: getCourseInfo(course_code),
      }))
    );
    const { rooms } = await rooms_fut;
    log.info({ elapsed_ms: elapsed_ms() }, "Resolved my-canvas-rooms-api");

    let courses: Record<TCourseCode, TTeachingCourse> = {};
    for (let [course_code, roles] of Object.entries(teaching)) {
      const kopps = await kopps_futs[course_code];
      log.info(
        { elapsed_ms: elapsed_ms() },
        `Resolved kopps for ${course_code}`
      );

      courses[course_code] = {
        course_code: course_code,
        title: kopps.title,
        credits: kopps.credits,
        creditUnitAbbr: kopps.creditUnitAbbr,
        roles: roles,
        rooms: rooms[course_code] || [],
      };
    }

    res.send({ courses });
  } catch (err) {
    next(err);
  }
});

// Copied from my-studies-api:
export type TApiUserCourse = {
  type: "kurser";
  course_code: TCourseCode;
  status?: "antagna" | "godkand" | "registrerade";
  year?: number;
  term?: "1" | "2";
  round?: string;
};
// Copied from my-studies-api:
export type TUserProgramme = {
  type: "program";
  program_code: TProgramCode;
  status?: "antagna" | "godkand" | "registrerade";
  year?: number;
  term?: "1" | "2";
};
// Copied from my-studies-api:
export type TApiUserStudies = {
  courses: Record<TCourseCode, TApiUserCourse[]>;
  programmes: Record<TProgramCode, TUserProgramme[]>;
};

api.get("/studies", async (req, res: Response<APIStudies>, next) => {
  try {
    const user: TSessionUser = req.session.user! || getFakeUserForDevelopment();
    assert(user !== undefined, "Mising user object");
    assert(
      user?.kthid !== undefined,
      "User object missing required property kthid"
    );

    const studies_fut = got
      .get<TApiUserStudies>(`${MY_STUDIES_API_URI}/user/${user.kthid}`, {
        responseType: "json",
      })
      .then((r) => r.body);
    const rooms_fut = get_canvas_rooms(user.kthid);

    const studies = await studies_fut;
    const kopps_futs: Record<TCourseCode, TKoppsCourseInfo> = Object.assign(
      {},
      ...Object.keys(studies.courses).map((course_code) => ({
        [course_code]: getCourseInfo(course_code),
      }))
    );
    const { rooms } = await rooms_fut;

    let courses: Record<TCourseCode, TStudiesCourse> = {};
    for (let [course_code, roles] of Object.entries(studies.courses)) {
      const kopps = await kopps_futs[course_code];

      courses[course_code] = {
        course_code: course_code,
        title: kopps.title,
        credits: kopps.credits,
        creditUnitAbbr: kopps.creditUnitAbbr,
        roles: roles,
        rooms: rooms[course_code],
      };
    }
    res.send({
      courses,
      programmes: studies.programmes,
    });
  } catch (err) {
    next(err);
  }
});

// kopps_cache is a local cache of course_code -> kopps info object.
// Note that we don't cache the entire (much larger) kopps response,
// but only the fields we care about.
// https://github.com/node-cache/node-cache
// The standard ttl is given in seconds, I guess anything between 12
// and 48 hours should be ok, maybe avoid purging stuff at the same
// time every day by using 40 hours.
const kopps_cache = new NodeCache({ stdTTL: 40 * 3600, useClones: false });

type TKoppsCourseInfo = {
  title: { sv: string; en: string };
  credits: number;
  creditUnitAbbr: string; // usually "hp", check other values!
};

async function getCourseInfo(
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
    log.error(err, `Failed to get kopps data for ${course_code}`);
    // Ugly but type-correct fallback, so things don't crash.
    // This is not cached!  Or should we cache it for a few minutes to
    // give kopps a chanse to start if it's broken?
    return { title: { sv: "-", en: "-" }, credits: 0, creditUnitAbbr: "-" };
  }
}

async function get_canvas_rooms(user: string): Promise<APICanvasRooms> {
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
