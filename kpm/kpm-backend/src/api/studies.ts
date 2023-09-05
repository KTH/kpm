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

const COURSE_STATUS_TO_SHOW = ["registrerade", "omregistrerade"];

// Copied from my-studies-api:
export type TApiUserCourse = {
  type: "kurser";
  course_code: TCourseCode;
  status?: "antagna" | "godkand" | "registrerade" | "omregistrerade";
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
      canvas_data = await rooms_fut;
    } catch (err) {
      log.error({ err, user }, "Failed to load canvas rooms");
    }
    const { courseRooms = null } = canvas_data || {};

    let courses: Record<TCourseCode, TStudiesCourse> = {};
    for (let [course_code, roles] of Object.entries(studies?.courses || [])) {
      const kopps = await kopps_futs[course_code];

      let completed = false;
      let mytermrounds: Record<
        string,
        Record<string, TStudiesCourseRound>
      > = {};
      for (let role of roles) {
        // Skip if course is completed
        if (role.status === "godkand") {
          completed = true;
          continue;
        }

        // Skip if missing required fields
        if (!role.status || !role.year || !role.term) {
          continue;
        }

        // Add rounds to course object
        const term = `${role.year}${role.term}`;
        mytermrounds[term] ??= {};

        const roleRound =
          role.round === undefined && role.status === "omregistrerade"
            ? "term"
            : role.round;

        // Skip if no round id can be determined
        if (roleRound === undefined) {
          continue;
        }

        // Add the term round object
        if (!mytermrounds[term][roleRound]) {
          const round = kopps.rounds[term]?.find(
            (value) => value.ladokRoundId === roleRound
          );

          const firstTuitionDate =
            round?.firstTuitionDate ?? getTermStartDate(role.year, role.term);
          const lastTuitionDate =
            round?.lastTuitionDate ?? getTermEndDate(role.year, role.term);

          mytermrounds[term][roleRound] = {
            status: role.status,
            year: role.year,
            term: role.term,
            ladokRoundId: roleRound,
            firstTuitionDate: firstTuitionDate,
            lastTuitionDate: lastTuitionDate,
            shortName:
              role.status === "omregistrerade" ? "omreg_lbl" : round?.shortName,
            // TODO: Consider relaxing how we decide if a course is current by
            // not strictly checking if there is a current round in kopps.
            // Rasmus has some thoughts about this.
            current: isRoundCurrent(firstTuitionDate, lastTuitionDate),
          };
          if (!round) {
            log.warn(
              { course_code, term, round: roleRound },
              "Round not found in kopps"
            );
          }
        }

        // If term round is missing status, add it
        if (!mytermrounds[term][roleRound].status) {
          mytermrounds[term][roleRound].status = role.status;
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
          rooms: courseRooms ? courseRooms?.[course_code] || [] : null,
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

function isRoundCurrent(firstTuitionDate?: string, lastTuitionDate?: string) {
  if (firstTuitionDate && lastTuitionDate) {
    const DAY_IN_MS = 24 * 3600 * 1000;
    // extend the tuition period for preparation and posts-course work.
    const start = Date.parse(firstTuitionDate) - 14 * DAY_IN_MS;
    const end = Date.parse(lastTuitionDate) + 25 * DAY_IN_MS;
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
function getTermStartDate(year: number, term: string): string | undefined {
  // Return start date as string in format "YYYY-MM-DD"
  if (term === "1") {
    return `${year}-01-17`;
  } else if (term === "2") {
    return `${year}-08-28`;
  }
}

function getTermEndDate(year: number, term: string): string | undefined {
  // Return end date as string in format "YYYY-MM-DD"
  if (term === "1") {
    return `${year}-08-29`;
  } else if (term === "2") {
    return `${year + 1}-01-16`; // exams are until January following year
  }
}
