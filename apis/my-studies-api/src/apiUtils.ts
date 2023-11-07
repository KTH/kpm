import {
  APIUserStudies,
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
function ensureInclusion<T extends U, U>(
  arr: ReadonlyArray<T>,
  el: U
): T | undefined {
  return arr.includes(el as T) ? (el as T) : undefined;
}

const courseRegex =
  /^ladok2\.kurser\.(?<code_pt1>[^\.]+)\.(?<code_pt2>[^\.]+)(\.(?<cstatus>[^\._]+)(_(?<cyear>\d{4})(?<cterm>\d{1})(\.(?<cterm_pt2>\d{1}))?)?)?$/i;

/**
 * Parse a UG group name
 *
 * @return a course if the group name is a course, null otherwise
 */
export function parseToUserCourse(ugGroupName: string): TUserCourse | null {
  const tmpJson = ugGroupName.match(courseRegex)?.groups;

  if (!tmpJson) {
    return null;
  }

  const { code_pt1, code_pt2, cstatus, cyear, cterm, cterm_pt2 } = tmpJson;

  const result: TUserCourse = {
    type: "kurser",
    course_code: `${code_pt1}${code_pt2}`,
  };

  if (cstatus) {
    result.status = ensureInclusion(STUDENT_STATUS, cstatus);
  }

  if (cyear) {
    result.year = parseInt(cyear, 10) || undefined;
  }

  if (cterm) {
    result.term = ensureInclusion(TERMS, cterm);
  }

  if (cterm_pt2) {
    result.round = cterm_pt2;
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
    result.status = ensureInclusion(STUDENT_STATUS, pstatus);
  }

  if (pyear) {
    result.year = parseInt(pyear, 10) || undefined;
  }

  if (pterm) {
    result.term = ensureInclusion(TERMS, pterm);
  }

  return result;
}

/**
 * Get program and course objects from a list of UG group names.
 */
export function convertToObjects(ugGroupNames: string[]): APIUserStudies {
  const result: APIUserStudies = {
    courses: {},
    programmes: {},
  };

  const allCourseGroups = ugGroupNames.map(parseToUserCourse);
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

export function convertToCourseObjects(inp: string[]): TUserCourse[] {
  const courseRegex =
    /^ladok2\.(?<type>kurser)\.(?<code_pt1>[^\.]*)\.(?<code_pt2>[^\.]*)(\.(?<cstatus>[^\._]*)(_(?<cyear>\d{4})(?<cterm>\d{1})(\.(?<cterm_pt2>\d{1}))?)?)?$/i;
  const tmpJson = inp
    ?.map((o) => o.match(courseRegex)?.groups)
    .filter((o) => o && o.type === "kurser");
  return tmpJson?.map((o: any) => {
    const { type, code_pt1, code_pt2, cstatus, cyear, cterm, cterm_pt2 } = o;
    return {
      type,
      course_code: `${code_pt1}${code_pt2}`,
      status: cstatus,
      year: parseInt(cyear) || undefined,
      term: cterm,
      round: cterm_pt2, // QUESTION: Is this really round id or perhaps section or something similar? Matches the last number of "registrerade_20221.1"
    };
  });
}

export function convertToProgrammeObjects(inp: string[]): TUserProgram[] {
  const progrRegex =
    /^ladok2\.(?<type>program)\.(?<code>[^\.]*)\.((?<pstatus>[^\._]*)_(?<pyear>\d{4})(?<pterm>\d{1}))$/i;
  const tmpJson = inp
    ?.map((o) => o.match(progrRegex)?.groups)
    .filter((o) => o && o.type === "program");
  return tmpJson?.map((o: any) => {
    const { type, code, pstatus, pyear, pterm } = o;
    return {
      type,
      program_code: code,
      status: pstatus,
      year: parseInt(pyear) || undefined,
      term: pterm,
    };
  });
}
