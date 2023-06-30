import { Request, Response, NextFunction } from "express";
import got from "got";
import log from "skog";
import {
  getCourseInfo,
  getSocial,
  get_canvas_rooms,
  sessionUser,
} from "./common";
import {
  APITeaching,
  TCourseCode,
  TTeachingCourse,
  TTeachingRole,
} from "kpm-backend-interface";
import { handleCommonGotErrors } from "./commonErrors";

const MY_TEACHING_API_URI =
  process.env.MY_TEACHING_API_URI || "http://localhost:3002/kpm/teaching";
const MY_TEACHING_API_TOKEN = process.env.MY_TEACHING_API_TOKEN!; // required by .env.in

export async function teachingApiHandler(
  req: Request,
  res: Response<APITeaching>,
  next: NextFunction
) {
  try {
    const user = sessionUser(req.session);
    const lang = req.headers["accept-language"];

    const perf1 = Date.now();
    const elapsed_ms = () => Date.now() - perf1;
    const teaching_fut = got
      .get<Record<TCourseCode, TTeachingRole[]>>(
        `${MY_TEACHING_API_URI}/user/${user.kthid}`,
        {
          responseType: "json",
          headers: {
            authorization: MY_TEACHING_API_TOKEN,
          },
        }
      )
      .then((r) => r.body)
      .catch(myTeachingApiErr);

    const rooms_fut = get_canvas_rooms(user.kthid).catch(myCanvasRoomsApiErr);

    const star_fut = getSocial<SocialCourses>(user, "courses", lang).catch(
      socialErr
    );
    log.debug({ elapsed_ms: elapsed_ms() }, "Initialized my-canvas-rooms-api");

    const teaching = await teaching_fut;
    log.debug({ elapsed_ms: elapsed_ms() }, "Resolved my-teaching-api");

    const kopps_futs = Object.assign(
      {},
      ...Object.keys(teaching || []).map((course_code) => ({
        [course_code]: getCourseInfo(course_code).catch(koppsErr),
      }))
    );

    let canvas_data;
    try {
      canvas_data = await rooms_fut;
    } catch (err) {
      log.error({ err, user }, "Failed to load canvas rooms");
    }
    const { courseRooms = null } = canvas_data || {};

    log.debug({ elapsed_ms: elapsed_ms() }, "Resolved my-canvas-rooms-api");

    let courses: Record<TCourseCode, TTeachingCourse> = {};
    for (let [course_code, roles] of Object.entries(teaching || [])) {
      const kopps = await kopps_futs[course_code];
      log.debug(
        { elapsed_ms: elapsed_ms() },
        `Resolved kopps for ${course_code}`
      );

      courses[course_code] = {
        course_code: course_code,
        title: kopps?.title,
        credits: kopps?.credits,
        creditUnitAbbr: kopps?.creditUnitAbbr,
        state: kopps?.state,
        roles: roles,
        rooms: courseRooms ? courseRooms?.[course_code] || [] : null,
        starred: false,
      };
    }
    const star_data = await star_fut;
    for (let { slug, starred } of star_data.courses) {
      if (starred && slug in courses) {
        courses[slug].starred = true;
      }
    }
    // Sort courses alphabetically by key (course_code)
    const tmp = Object.entries(courses).sort(
      ([a], [b]) => (a < b && -1) || (a > b && 1) || 0
    );
    courses = Object.fromEntries(tmp);

    res.send({ courses });
  } catch (err) {
    next(err);
  }
}

type SocialCourses = {
  courses: [SocialCourse];
};
type SocialCourse = {
  slug: TCourseCode;
  starred: boolean;
};

function koppsErr(err: any) {
  handleCommonGotErrors(err);
  // TODO: Add API specific error handling
  Error.captureStackTrace(err, koppsErr);
  throw err;
}

function myTeachingApiErr(err: any) {
  handleCommonGotErrors(err);
  // TODO: Add API specific error handling
  Error.captureStackTrace(err, myTeachingApiErr);
  throw err;
}

function myCanvasRoomsApiErr(err: any) {
  if (err.message.indexOf("401") > -1) {
    // We couldn't access Canvas, setting result to null
    return null;
  }
  handleCommonGotErrors(err);
  // TODO: Add API specific error handling
  Error.captureStackTrace(err, myCanvasRoomsApiErr);
  throw err;
}

function socialErr(err: any) {
  try {
    handleCommonGotErrors(err);
    // TODO: Add API specific error handling
    Error.captureStackTrace(err, socialErr);
    throw err;
  } catch (error) {
    log.error({ error }, "Failed to get social course stars");
    return { courses: [] };
  }
}
