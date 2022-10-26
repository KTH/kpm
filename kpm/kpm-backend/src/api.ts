import express from "express";
import got from "got";
import {
  APIStudies,
  APITeaching,
  APICanvasRooms,
  TTeachingCourse,
  TTeachingRole,
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
    const teaching = await got
      .get<Record<string, TTeachingRole[]>>(
        `${MY_TEACHING_API_URI}/user/${user}`,
        {
          responseType: "json",
        }
      )
      .then((r) => r.body);

    const { rooms } = await got
      .get<any>(`${MY_CANVAS_ROOMS_API_URI}/user/${user}`, {
        responseType: "json",
        headers: {
          authorization: CANVAS_TOKEN,
        },
      })
      .then((r) => r.body);

    let courses: Record<string, TTeachingCourse> = {};
    for (let [course_code, roles] of Object.entries(teaching)) {
      const kopps = await getCourseInfo(course_code);
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

async function getCourseInfo(course_code: string) {
  const { title, credits, creditUnitAbbr } = await got
    .get<{
      title: { sv: string; en: string };
      credits: number;
      creditUnitAbbr: string;
    }>(`${KOPPS_API}/course/${course_code}`, {
      responseType: "json",
    })
    .then((r) => r.body);
  return { title, credits, creditUnitAbbr };
}
