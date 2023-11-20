import {
  APIUserStudies,
  STUDENT_STATUS,
  TERMS,
  TApiUserCourse,
  TUserProgram,
} from "./interfaces";

/*
  Don't panic, it is just a regex! :D The trick is optional match groups (...)? and optional matches |
  This allows us to both match program and kurser but also different lengths of kurser.
  Use https://regex101.com/ to investigate, debug or extend.

  regex that matches BOTH program and course
  const nameRegex = /^ladok2\.(?<type>[^\.]*)<\.(?<code_pt1>[^\.]*)\.(((?<pstatus>[^\._]*)_(?<pyear>\d{4})(?<pterm>\d{1}))|(?<code_pt2>[^\.]*)(\.(?<cstatus>[^\._]*)(_(?<cyear>\d{4})(?<cterm>\d{1})(\.(?<cterm_pt2>\d{1}))?)?)?)$/i

  Tested matches for regex check:
  ladok2.kurser.SE.1020
  ladok2.kurser.ME.2053.antagna_20222
  ladok2.kurser.MF.2102.godkand
  ladok2.kurser.MF.2114
  ladok2.kurser.MF.2032.registrerade_20221.1
  ladok2.kurser.MF.2039.registrerade_20212.1
  ladok2.program.TIPDM.registrerade_20221
  ladok2.kurser.ÅF.2102.godkand
  ladok2.kurser.ÅF.210v.godkand
*/

const courseRegexOld =
  /^ladok2\.kurser\.(?<code_pt1>[^\.]+)\.(?<code_pt2>[^\.]+)(\.(?<cstatus>[^\.\d]+)(_(?<cyear>\d{4})(?<cterm>\d{1})(\.(?<cterm_pt2>\d{1}))?)?)?$/i;

const courseRegexNew =
  /^ladok2\.kurser\.(?<code_pt1>[^\.]+)\.(?<code_pt2>[^\.]+)(\.(?<cyear>\d{4})(?<cterm>\d{1})(\.(?<roundCode>\w+)(\.(?<cstatus>[^\.]+)?)?)?)?$/i;

/**
 * Parse a UG group name
 *
 * @return a course if the group name is a course, null otherwise
 */
export function parseToUserCourse(ugGroupName: string): TApiUserCourse | null {
  const tmpJson = ugGroupName.match(courseRegexOld)?.groups;

  if (!tmpJson) {
    return null;
  }

  const { code_pt1, code_pt2, cstatus, cyear, cterm, cterm_pt2 } = tmpJson;

  const result: TApiUserCourse = {
    type: "kurser",
    course_code: `${code_pt1}${code_pt2}`,
  };

  if (cstatus) {
    result.status = STUDENT_STATUS.find((s) => s === cstatus);
  }

  if (cyear) {
    result.year = parseInt(cyear, 10) || undefined;
  }

  if (cterm) {
    result.term = TERMS.find((t) => t === cterm);
  }

  if (cterm_pt2) {
    result.round = cterm_pt2;
  }

  return result;
}

export function parseToUserCourseNew(
  ugGroupName: string
): TApiUserCourse | null {
  const regexMatch = ugGroupName.match(courseRegexNew)?.groups;

  if (!regexMatch) {
    return null;
  }

  const { code_pt1, code_pt2, cyear, cterm, roundCode, cstatus } = regexMatch;

  const result: TApiUserCourse = {
    type: "kurser",
    course_code: `${code_pt1}${code_pt2}`,
  };

  // New status are called "registrerad", "antagen" and "godkand"
  if (cstatus === "registrerad") {
    result.status = "registrerade";
  }

  if (cstatus === "antagen") {
    result.status = "antagna";
  }

  if (cstatus === "godkand") {
    result.status = "godkand";
  }

  if (cyear) {
    result.year = parseInt(cyear, 10) || undefined;
  }

  if (cterm) {
    result.term = TERMS.find((t) => t === cterm);
  }

  if (roundCode) {
    result.round_code = roundCode;
  }

  return result;
}

export function parseToUserProgram(ugGroupName: string): TUserProgram | null {
  const progrRegex =
    /^ladok2\.program\.(?<code>[^\.]+)\.((?<pstatus>[^\._]+)_(?<pyear>\d{4})(?<pterm>\d{1}))$/i;
  const regexMatch = ugGroupName.match(progrRegex)?.groups;

  if (!regexMatch) {
    return null;
  }

  const { type, code, pstatus, pyear, pterm } = regexMatch;

  const result: TUserProgram = {
    type: "program",
    program_code: code,
  };

  if (pstatus) {
    result.status = STUDENT_STATUS.find((s) => s === pstatus);
  }

  if (pyear) {
    result.year = parseInt(pyear, 10) || undefined;
  }

  if (pterm) {
    result.term = TERMS.find((t) => t === pterm);
  }

  return result;
}

/**
 * Get program and course objects from a list of UG group names.
 */
export function parseUgGroupNames(ugGroupNames: string[]): APIUserStudies {
  const result: APIUserStudies = {
    courses: {},
    programmes: {},
  };

  const allCourseGroups = ugGroupNames.map(
    (name) => parseToUserCourse(name) ?? parseToUserCourseNew(name)
  );
  for (const course of allCourseGroups) {
    if (!course) {
      continue;
    }

    result.courses[course.course_code] ??= [];
    result.courses[course.course_code].push(course);
  }

  const allProgramGroups = ugGroupNames.map(parseToUserProgram);
  for (const program of allProgramGroups) {
    if (!program) {
      continue;
    }

    result.programmes[program.program_code] ??= [];
    result.programmes[program.program_code].push(program);
  }

  return result;
}
