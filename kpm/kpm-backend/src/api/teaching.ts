import { Request, Response, NextFunction } from "express";
import got from "got";
import log from "skog";
import { getCourseInfo, getSocial, get_canvas_rooms, sessionUser } from "./common";
import { APITeaching, TAPITeachingEndpointError, TCourseCode, TTeachingCourse, TTeachingRole } from "kpm-backend-interface";
import { EndpointError } from "kpm-api-common/src/errors";
import { handleCommonGotErrors } from "./commonErrors";

const MY_TEACHING_API_URI =
  process.env.MY_TEACHING_API_URI || "http://localhost:3002/kpm/teaching";

export async function teachingApiHandler(req: Request, res: Response<APITeaching>, next: NextFunction) {
  try {
    const user = sessionUser(req.session);

    const perf1 = Date.now();
    const elapsed_ms = () => Date.now() - perf1;
    const teaching_fut = got
      .get<Record<TCourseCode, TTeachingRole[]>>(
        `${MY_TEACHING_API_URI}/user/${user.kthid}`,
        {
          responseType: "json",
        }
      )
      .then((r) => r.body)
      .catch(getMyTeachingApiErrorHandler);

    const rooms_fut = get_canvas_rooms(user.kthid).catch(getMyCanvasRoomsApiErrorHandler);
    log.debug({ elapsed_ms: elapsed_ms() }, "Initialized my-canvas-rooms-api");

    const teaching = await teaching_fut;
    log.debug({ elapsed_ms: elapsed_ms() }, "Resolved my-teaching-api");

    const kopps_futs = Object.assign(
      {},
      ...Object.keys(teaching || []).map((course_code) => ({
        [course_code]: getCourseInfo(course_code).catch(getKoppsErrorHandler),
      }))
    );
    const { rooms } = await rooms_fut || {};
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
        title: kopps.title,
        credits: kopps.credits,
        creditUnitAbbr: kopps.creditUnitAbbr,
        roles: roles,
        rooms: rooms?.[course_code] || [],
      };
    }

    res.send({ courses });
  } catch (err) {
    next(err);
  }
}

class TeachingApiEndpointError extends EndpointError<TAPITeachingEndpointError> {}

function getKoppsErrorHandler(err: any) {
  handleCommonGotErrors("KOPPS", err, (props: any) => new TeachingApiEndpointError(props));
  
  Error.captureStackTrace(err, getKoppsErrorHandler);
  throw err;
}

function getMyTeachingApiErrorHandler(err: any) {
  handleCommonGotErrors("my-teaching-api", err, (props: any) => new TeachingApiEndpointError(props));
  
  Error.captureStackTrace(err, getMyTeachingApiErrorHandler);
  throw err;
}

function getMyCanvasRoomsApiErrorHandler(err: any) {
  handleCommonGotErrors("my-canvas-rooms-api", err, (props: any) => new TeachingApiEndpointError(props));
  
  Error.captureStackTrace(err, getMyCanvasRoomsApiErrorHandler);
  throw err;
}


