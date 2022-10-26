import express from "express";
import got from "got";
import NodeCache from "node-cache";
import {
  APIStudies,
  APITeaching,
  APICanvasRooms,
  TTeachingCourse,
  TTeachingRole,
  TCourseCode,
} from "kpm-backend-interface";

const MY_CANVAS_ROOMS_API_URI =
  process.env.MY_CANVAS_ROOMS_API_URI ||
  "http://localhost:3001/kpm/canvas-rooms";
const MY_TEACHING_API_URI =
  process.env.MY_TEACHING_API_URI || "http://localhost:3002/kpm/teaching";
const MY_STUDIES_API_URI =
  process.env.MY_STUDIES_API_URI || "http://localhost:3003/kpm/studies";
const CANVAS_TOKEN = process.env.CANVAS_TOKEN;
const KOPPS_API = "https://api.kth.se/api/kopps/v2";

export const api = express.Router();

// TODO: Add session handling

api.get("/", (req, res) => {
  return res.send({
    msg: "ok",
  });
});

api.get("/canvas-rooms", async (req, res, next) => {
  try {
    const { rooms } = await got
      .get<any>(`${MY_CANVAS_ROOMS_API_URI}/user/u1famwov`, {
        responseType: "json",
        headers: {
          authorization: CANVAS_TOKEN,
        },
      })
      .then((r) => r.body);

    res.send({
      rooms,
    } as APICanvasRooms);
  } catch (err) {
    next(err);
  }
});

api.get("/teaching", async (req, res, next) => {
  const user = "u1i6bme8"; // FIXME: Get kthid of logged in user!
  try {
    const teaching_fut = got
      .get<Record<TCourseCode, TTeachingRole[]>>(
        `${MY_TEACHING_API_URI}/user/${user}`,
        {
          responseType: "json",
        }
      )
      .then((r) => r.body);

    const rooms_fut = got
      .get<any>(`${MY_CANVAS_ROOMS_API_URI}/user/${user}`, {
        responseType: "json",
        headers: {
          authorization: CANVAS_TOKEN,
        },
      })
      .then((r) => r.body);

    const teaching = await teaching_fut;

    const kopps_futs = Object.assign(
      {},
      ...Object.keys(teaching).map((course_code) => ({
        [course_code]: getCourseInfo(course_code),
      }))
    );
    const { rooms } = await rooms_fut;

    let courses: Record<TCourseCode, TTeachingCourse> = {};
    for (let [course_code, roles] of Object.entries(teaching)) {
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

    res.send({ courses });
  } catch (err) {
    next(err);
  }
});

api.get("/studies", async (req, res, next) => {
  try {
    const { courses, programmes } = await got
      .get<any>(`${MY_STUDIES_API_URI}/user/u1famwov`, {
        responseType: "json",
      })
      .then((r) => r.body);

    res.send({
      courses,
      programmes,
    } as APIStudies);
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

async function getCourseInfo(course_code: TCourseCode) {
  const result = kopps_cache.get(course_code);
  if (result) {
    return result;
  }
  const { title, credits, creditUnitAbbr } = await got
    .get<{
      title: { sv: string; en: string };
      credits: number;
      creditUnitAbbr: string;
    }>(`${KOPPS_API}/course/${course_code}`, {
      responseType: "json",
    })
    .then((r) => r.body);
  const info = { title, credits, creditUnitAbbr };
  kopps_cache.set(course_code, info);
  return info;
}
