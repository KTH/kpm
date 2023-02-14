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
  TKoppsRoundInTerm,
} from "./common";
import { handleCommonGotErrors } from "./commonErrors";

const MY_STUDIES_API_URI =
  process.env.MY_STUDIES_API_URI || "http://localhost:3003/kpm/studies";
const MY_STUDIES_API_TOKEN = process.env.MY_STUDIES_API_TOKEN!; // required by .env.in

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
        headers: {
          authorization: MY_STUDIES_API_TOKEN,
        },
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
    let canvas_data;
    try {
      canvas_data = (await rooms_fut) || { rooms: {} };
    } catch (err) {
      log.error({ err, user }, "Failed to load canvas rooms");
      canvas_data = { rooms: {} };
    }
    const { rooms } = canvas_data;

    let courses: Record<TCourseCode, TStudiesCourse> = {};
    for (let [course_code, roles] of Object.entries(studies?.courses || [])) {
      const kopps = await kopps_futs[course_code];

      let completed = false;
      let mytermrounds: Record<
        string,
        Record<string, TStudiesCourseRound>
      > = {};
      for (let role of roles) {
        if (role.status === "godkand") {
          completed = true;
        } else if (role.status && role.year && role.term && role.round) {
          const term = `${role.year}${role.term}`;
          if (!mytermrounds[term]) {
            mytermrounds[term] = {};
          }
          if (!mytermrounds[term][role.round]) {
            const round = kopps.rounds[term]?.find(
              (value) => value.ladokRoundId == role.round
            );
            mytermrounds[term][role.round] = {
              status: role.status,
              year: role.year,
              term: role.term,
              ladokRoundId: role.round,
              firstTuitionDate: round?.firstTuitionDate,
              lastTuitionDate: round?.lastTuitionDate,
              shortName: round?.shortName,
              current: isRoundCurrent(round),
            };
            if (!round) {
              log.warn(
                { course_code, term, round: role.round },
                "Round not found in kopps"
              );
            }
          } else if (
            !mytermrounds[term][role.round].status ||
            role.status == "registrerade"
          ) {
            mytermrounds[term][role.round].status = role.status;
          }
        }
      }
      let current_rounds: TStudiesCourseRound[] = [];
      let other_rounds: TStudiesCourseRound[] = [];
      for (let [_term, rounds] of Object.entries(mytermrounds)) {
        for (let [_id, round] of Object.entries(rounds)) {
          if (round.current) {
            current_rounds.push(round);
          } else {
            other_rounds.push(round);
          }
        }
      }
      if (kopps) {
        courses[course_code] = {
          course_code: course_code,
          title: kopps.title,
          credits: kopps.credits,
          creditUnitAbbr: kopps.creditUnitAbbr,
          rooms: rooms ? rooms?.[course_code] || [] : null,
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

function isRoundCurrent(round?: TKoppsRoundInTerm) {
  if (round) {
    const DAY_IN_MS = 24 * 3600 * 1000;
    const start = Date.parse(round.firstTuitionDate) - 5 * DAY_IN_MS;
    const end = Date.parse(round.lastTuitionDate) + 25 * DAY_IN_MS;
    const now = Date.now();
    return start < now && end > now;
  } else {
    return false;
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
  if (err.message.indexOf("401") > -1) {
    // We couldn't access Canvas, setting result to null
    return null;
  }
  handleCommonGotErrors(err);
  // TODO: Add API specific error handling
  Error.captureStackTrace(err, myCanvasRoomsApiErr);
  throw err;
}
