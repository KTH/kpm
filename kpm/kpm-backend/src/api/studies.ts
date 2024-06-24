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
import { APIUserStudies, TApiUserCourse } from "my-studies-api/src/interfaces";

const MY_STUDIES_API_URI =
  process.env.MY_STUDIES_API_URI || "http://localhost:3003/kpm/studies";
const MY_STUDIES_API_TOKEN = process.env.MY_STUDIES_API_TOKEN!; // required by .env.in

// TODO: Use or remove
const COURSE_STATUS_TO_SHOW = ["registrerade", "omregistrerade"];

type TRoundStatus = "antagna" | "registrerade" | "omregistrerade" | "godkand";

export async function studiesApiHandler(
  req: Request,
  res: Response<APIStudies>,
  next: NextFunction
) {
  try {
    const user = sessionUser(req.session);

    const studies_fut = got
      .get<APIUserStudies>(`${MY_STUDIES_API_URI}/user/${user.kthid}`, {
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

      let completed = roles.some((o) => o.status === "godkand");

      let mytermrounds: Record<
        string,
        Array<TApiUserCourse & Partial<TKoppsRoundInTerm>>
      > = {};
      for (let role of roles) {
        // Skip roles that does not represent a course round
        if (role.year === undefined || role.term === undefined) continue;

        if (role.round === undefined && role.round_code === undefined) continue;

        // Add rounds to course object
        const term = `${role.year}${role.term}`;
        mytermrounds[term] ??= [];

        // Find kopps round entry by round id hack...
        const round = kopps.rounds[term]?.find(
          (value) =>
            value.ladokRoundId === role.round ||
            value.applicationCode === role.round_code
        );

        if (role.round && !round) {
          // omreg doesn't have rounds so we don't log a warning
          log.warn(
            { course_code, term, round: role.round },
            "Round not found in kopps"
          );
        }

        mytermrounds[term].push({
          ...role,
          ...round,
        });
      }

      let courseIsCurrent = false;
      let courseRounds: TStudiesCourseRound[] = [];
      for (let [_term, rounds] of Object.entries(mytermrounds)) {
        const termRounds = reduceRoundsObject(rounds);
        courseIsCurrent ||= termRounds.some((o) => isRoundCurrent(o));
        courseRounds = [...courseRounds, ...termRounds];
      }

      if (kopps) {
        courses[course_code] = {
          course_code: course_code,
          title: kopps.title,
          credits: kopps.credits,
          creditUnitAbbr: kopps.creditUnitAbbr,
          rooms: courseRooms ? courseRooms?.[course_code] || [] : null,
          completed,
          rounds: [...courseRounds],
          current: courseIsCurrent,
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

function reduceRoundsObject(
  roundsInTerm: Array<TApiUserCourse & Partial<TKoppsRoundInTerm>>
): TStudiesCourseRound[] {
  // Find rounds for a term and determine if it is current based on round start and end date.
  // Re-registrations without a term registration are considered current for the entire term.
  const termRounds: Record<string, TStudiesCourseRound> = {};
  let hasRegularRound = false;
  for (let round of roundsInTerm) {
    if (round.status === undefined) continue;

    const {
      status,
      year,
      term,
      ladokRoundId,
      applicationCode,
      firstTuitionDate,
      lastTuitionDate,
      shortName,
    } = round;

    if (status === undefined) continue;
    if (year === undefined) continue;
    if (term === undefined) continue;

    if (ladokRoundId) {
      // antagen | registrerad | godkand
      termRounds[ladokRoundId] = {
        status: bestStatus(termRounds[ladokRoundId]?.status, status),
        year,
        term,
        ladokRoundId,
        applicationCode,
        firstTuitionDate,
        lastTuitionDate,
        shortName,
      };
      hasRegularRound ||= true;
    } else {
      // omregistrerad
      termRounds["omreg"] = {
        status,
        year,
        term,
        firstTuitionDate: getTermStartDate(year, term),
        lastTuitionDate: getTermEndDate(year, term),
        shortName: "omreg_lbl",
      };
    }
  }

  // The output of this function is used to determine if a course is current.
  // If there is a regular round we shouldn't consider re-registrations.
  if (hasRegularRound) {
    delete termRounds["omreg"];
  }

  return Object.values(termRounds);
}

/**
 * Returns `true` if the `inp` course round is considered "current" for the student
 */
function isRoundCurrent(inp: TStudiesCourseRound) {
  const { firstTuitionDate, lastTuitionDate } = inp;

  if (firstTuitionDate && lastTuitionDate) {
    const DAY_IN_MS = 24 * 3600 * 1000;
    const now = Date.now();

    if (inp.status === "antagna") {
      // An "antagna" student needs access only when they can register to the
      // course. After the registration period, is no longer considered
      // "current"
      // - 14 days before course start
      // - 10 days after course start
      const start = Date.parse(firstTuitionDate) - 14 * DAY_IN_MS;
      const end = Date.parse(firstTuitionDate) + 10 * DAY_IN_MS;

      return start < now && end > now;
    } else {
      // The rest of students ("registrerade", "omregistrerade", "godkand") need
      // access to a course before it starts and after it finishes:
      // - 14 days before course start (for preparation)
      // - 25 days after course end (for post-course work)
      const start = Date.parse(firstTuitionDate) - 14 * DAY_IN_MS;
      const end = Date.parse(lastTuitionDate) + 25 * DAY_IN_MS;
      return start < now && end > now;
    }
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

function bestStatus(
  oldVal: TRoundStatus | undefined,
  newVal: TRoundStatus
): TRoundStatus {
  switch (newVal) {
    case "antagna":
    case "registrerade":
      if (oldVal === "godkand" || oldVal === "registrerade") {
        return oldVal;
      } else {
        return newVal;
      }
    case "godkand":
      return newVal;
    default:
      return oldVal ?? newVal;
  }
}
