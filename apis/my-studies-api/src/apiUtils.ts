import {
  TAPIUserStudies,
  STUDENT_STATUS,
  TERMS,
  TUserCourse,
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
export function getListOfCourseProgrammeNames(inp: string[]) {
  if (inp === undefined)
    return {
      courseNames: [],
      programmeNames: [],
    };

  const splitRegex = /^ladok2\.(?<type>[^\.]*)\./i;
  const courseNames: string[] = [];
  const programmeNames: string[] = [];
  inp.forEach((name) => {
    const tmp = name.match(splitRegex)?.groups;
    if (tmp?.type === "kurser") {
      return courseNames.push(name);
    }
    if (tmp?.type === "program") {
      return programmeNames.push(name);
    }
  });

  return {
    courseNames,
    programmeNames,
  };
}

/**
 * Given an array `arr` and an element `el`, returns `el` if  is member of `arr`,
 * `undefined` otherwise.
 *
 * If `arr` is defined as narrower type of array, ensures that returned element
 * has the narrow type
 */
function typedFind<T extends U, U>(
  arr: ReadonlyArray<T>,
  el: U
): T | undefined {
  return arr.find((e) => e === el);
}

const courseRegexOld =
  /^ladok2\.kurser\.(?<code_pt1>[^\.]+)\.(?<code_pt2>[^\.]+)(\.(?<cstatus>[^\.\d]+)(_(?<cyear>\d{4})(?<cterm>\d{1})(\.(?<cterm_pt2>\d{1}))?)?)?$/i;

const courseRegexNew =
  /^ladok2\.kurser\.(?<code_pt1>[^\.]+)\.(?<code_pt2>[^\.]+)(\.(?<cyear>\d{4})(?<cterm>\d{1})(\.(?<roundCode>\w+)(\.(?<cstatus>[^\.]+)?)?)?)?$/i;

/**
 * Parse a UG group name
 *
 * @return a course if the group name is a course, null otherwise
 */
export function parseToUserCourse(ugGroupName: string): TUserCourse | null {
  const tmpJson = ugGroupName.match(courseRegexOld)?.groups;

  if (!tmpJson) {
    return null;
  }

  const { code_pt1, code_pt2, cstatus, cyear, cterm, cterm_pt2 } = tmpJson;

  const result: TUserCourse = {
    type: "kurser",
    course_code: `${code_pt1}${code_pt2}`,
  };

  if (cstatus) {
    result.status = typedFind(STUDENT_STATUS, cstatus);
  }

  if (cyear) {
    result.year = parseInt(cyear, 10) || undefined;
  }

  if (cterm) {
    result.term = typedFind(TERMS, cterm);
  }

  if (cterm_pt2) {
    result.round = cterm_pt2;
  }

  return result;
}

export function parseToUserCourseNew(ugGroupName: string): TUserCourse | null {
  const tmpJson = ugGroupName.match(courseRegexNew)?.groups;

  if (!tmpJson) {
    return null;
  }

  const { code_pt1, code_pt2, cyear, cterm, roundCode, cstatus } = tmpJson;

  const result: TUserCourse = {
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
    result.term = typedFind(TERMS, cterm);
  }

  if (roundCode) {
    result.round_code = roundCode;
  }

  return result;
}

export function parseToUserProgram(ugGroupName: string): TUserProgram | null {
  const progrRegex =
    /^ladok2\.program\.(?<code>[^\.]+)\.((?<pstatus>[^\._]+)_(?<pyear>\d{4})(?<pterm>\d{1}))$/i;
  const tmpJson = ugGroupName.match(progrRegex)?.groups;

  if (!tmpJson) {
    return null;
  }

  const { type, code, pstatus, pyear, pterm } = tmpJson;

  const result: TUserProgram = {
    type: "program",
    program_code: code,
  };

  if (pstatus) {
    result.status = typedFind(STUDENT_STATUS, pstatus);
  }

  if (pyear) {
    result.year = parseInt(pyear, 10) || undefined;
  }

  if (pterm) {
    result.term = typedFind(TERMS, pterm);
  }

  return result;
}

/**
 * Get program and course objects from a list of UG group names.
 */
export function convertToObjects(ugGroupNames: string[]): TAPIUserStudies {
  const result: TAPIUserStudies = {
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

    result.courses[program.program_code] ??= [];
    result.programmes[program.program_code].push(program);
  }

  return result;
}
