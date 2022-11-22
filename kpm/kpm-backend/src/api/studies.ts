import { Request, Response, NextFunction } from "express";
import got from "got";
import { EndpointError } from "kpm-api-common/src/errors";
import { APIStudies, TAPIStudiesEndpointError, TCourseCode, TProgramCode, TStudiesCourse } from "kpm-backend-interface";
import { getCourseInfo, get_canvas_rooms, sessionUser, TKoppsCourseInfo } from "./common";
import { handleCommonKoppsErrors, handleCommonMyApiErrors } from "./commonErrors";

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
      .then((r) => r.body)
      .catch(getMyStudiesApiErrorHandler);
    const rooms_fut = get_canvas_rooms(user.kthid).catch(getMyCanvasRoomsApiErrorHandler);

    const studies = await studies_fut;
    const kopps_futs: Record<TCourseCode, Promise<TKoppsCourseInfo>> = Object.assign(
      {},
      ...Object.keys(studies?.courses || []).map((course_code) => ({
        [course_code]: getCourseInfo(course_code).catch(getKoppsErrorHandler),
      }))
    );
    const { rooms } = await rooms_fut || {};

    let courses: Record<TCourseCode, TStudiesCourse> = {};
    for (let [course_code, roles] of Object.entries(studies?.courses || [])) {
      const kopps = await kopps_futs[course_code];

      if (kopps) {
        courses[course_code] = {
          course_code: course_code,
          title: kopps.title,
          credits: kopps.credits,
          creditUnitAbbr: kopps.creditUnitAbbr,
          roles: roles,
          rooms: rooms?.[course_code] || [],
        };
      }
    }
    res.send({
      courses,
      programmes: studies?.programmes || {},
    });
  } catch (err) {
    next(err);
  }
}

class StudiesApiEndpointError extends EndpointError<TAPIStudiesEndpointError> {}

function getMyStudiesApiErrorHandler(err: any) {
  // First our handled errors (these are operational errors that are expected)
  // - Handle specific errors and throw GroupsApiEndpointError

  // - Handle common errors (but make sure we get specific error type)  if (err.name === "RequestError") {
  handleCommonMyApiErrors("my-studies-api", err, (props: any) => new StudiesApiEndpointError(props));
  
  // And last our unhandled operational errors, we need to create a proper async
  // stacktrace for debugging
  Error.captureStackTrace(err, getMyStudiesApiErrorHandler);
  throw err;
}

function getKoppsErrorHandler(err: any) {
  // First our handled errors (these are operational errors that are expected)
  // - Handle specific errors and throw GroupsApiEndpointError

  // - Handle common errors (but make sure we get specific error type)  if (err.name === "RequestError") {
  handleCommonKoppsErrors(err, (props: any) => new StudiesApiEndpointError(props));
  
  // And last our unhandled operational errors, we need to create a proper async
  // stacktrace for debugging
  Error.captureStackTrace(err, getKoppsErrorHandler);
  throw err;
}

function getMyCanvasRoomsApiErrorHandler(err: any) {
  // First our handled errors (these are operational errors that are expected)
  // - Handle specific errors and throw GroupsApiEndpointError

  // - Handle common errors (but make sure we get specific error type)  if (err.name === "RequestError") {
  handleCommonMyApiErrors("my-canvas-rooms-api", err, (props: any) => new StudiesApiEndpointError(props));
  
  // And last our unhandled operational errors, we need to create a proper async
  // stacktrace for debugging
  Error.captureStackTrace(err, getMyCanvasRoomsApiErrorHandler);
  throw err;
}
