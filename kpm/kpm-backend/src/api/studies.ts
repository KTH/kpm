import { Request, Response, NextFunction } from "express";
import got from "got";
import { APIStudies, TCourseCode, TProgramCode, TStudiesCourse } from "kpm-backend-interface";
import { getCourseInfo, get_canvas_rooms, sessionUser, TKoppsCourseInfo } from "./common";

const MY_STUDIES_API_URI =
  process.env.MY_STUDIES_API_URI || "http://localhost:3003/kpm/studies";

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

export async function studiesApiHandler(req: Request, res: Response<APIStudies>, next: NextFunction) {
  try {
    const user = sessionUser(req.session);

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
}