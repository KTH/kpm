import { Request, Response, NextFunction } from "express";
import got from "got";
import log from "skog";
import {
  APIStudies,
  TCourseCode,
  TProgramCode,
  TStudiesCourse,
  TStudiesCourseRound,
} from "kpm-backend-interface";
import {
  getCourseInfo,
  get_canvas_rooms,
  sessionUser,
  TKoppsCourseInfo,
} from "./common";
import { handleCommonGotErrors } from "./commonErrors";

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

export async function studiesApiHandler(
  req: Request,
  res: Response<APIStudies>,
  next: NextFunction
) {
  try {
    const user = sessionUser(req.session);

    const studies_fut = got
      .get<TApiUserStudies>(`${MY_STUDIES_API_URI}/user/${user.kthid}`, {
        responseType: "json",
      })
      .then((r) => r.body)
      .catch(myStudiesApiErr);
    const rooms_fut = get_canvas_rooms(user.kthid).catch(myCanvasRoomsApiErr);

    const studies = await studies_fut;
    const kopps_futs: Record<
      TCourseCode,
      Promise<TKoppsCourseInfo>
    > = Object.assign(
      {},
      ...Object.keys(studies?.courses || []).map((course_code) => ({
        [course_code]: getCourseInfo(course_code).catch(koppsErr),
      }))
    );
    const { rooms } = (await rooms_fut) || {};
    const DAY_IN_MS = 24 * 3600 * 1000;

    let courses: Record<TCourseCode, TStudiesCourse> = {};
    for (let [course_code, roles] of Object.entries(studies?.courses || [])) {
      const kopps = await kopps_futs[course_code];

      let completed = false;
      let current_rounds: TStudiesCourseRound[] = [];
      let other_rounds: TStudiesCourseRound[] = [];
      for (let role of roles) {
        if (role.status === "godkand") {
          completed = true;
        } else if (role.status && role.year && role.term && role.round) {
          const term = `${role.year}${role.term}`;
          const round = kopps.rounds[term].find(
            (value) => value.ladokRoundId == role.round
          );
          if (round) {
            const start = Date.parse(round.firstTuitionDate) - 5 * DAY_IN_MS;
            const end = Date.parse(round.lastTuitionDate) + 25 * DAY_IN_MS;
            const now = Date.now();
            const current = start < now && end > now;
            let result: TStudiesCourseRound = {
              status: role.status,
              year: role.year,
              term: role.term,
              ladokRoundId: round.ladokRoundId,
              firstTuitionDate: round.firstTuitionDate,
              lastTuitionDate: round.lastTuitionDate,
              shortName: round.shortName,
              current,
            };
            if (current) {
              current_rounds.push(result);
            } else {
              other_rounds.push(result);
            }
          } else {
            log.warn(
              { course_code, term, round: role.round },
              "Round not found in kopps"
            );
            let result: TStudiesCourseRound = {
              status: role.status,
              year: role.year,
              term: role.term,
              ladokRoundId: role.round,
              current: false,
            };
            other_rounds.push(result);
          }
        }
      }
      if (kopps) {
        courses[course_code] = {
          course_code: course_code,
          title: kopps.title,
          credits: kopps.credits,
          creditUnitAbbr: kopps.creditUnitAbbr,
          rooms: rooms?.[course_code] || [],
          completed,
          rounds: [...current_rounds, ...other_rounds],
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

// DONE: Remove downstream API name and add an error logging code that we can show to the user for debugging
// DONE: Always throw EndpointError, not point in subclassing, makes shared code more complicated.
// FAIL: Make sure the allowed ErrorTypes are explicit in the error handler
// TODO: Wrap the error handlers in common try/catch se we can remove some boilerplate code in the handlers
//       - if this doesn't mess upp the async stacktrace
function myStudiesApiErr(err: any) {
  handleCommonGotErrors(err);
  // TODO: Add API specific error handling
  Error.captureStackTrace(err, myStudiesApiErr);
  throw err;
}

function koppsErr(err: any) {
  handleCommonGotErrors(err);
  // TODO: Add API specific error handling
  Error.captureStackTrace(err, koppsErr);
  throw err;
}

function myCanvasRoomsApiErr(err: any) {
  handleCommonGotErrors(err);
  // TODO: Add API specific error handling
  Error.captureStackTrace(err, myCanvasRoomsApiErr);
  throw err;
}
