import { describe, expect, jest, test } from "@jest/globals";
import {
  parseToUserCourse,
  parseToUserProgram,
  // convertToCourseObjects,
  // convertToProgrammeObjects,
} from "../src/apiUtils";
import { TUserCourse, TUserProgram } from "../src/interfaces";

// ladok2.kurser.SE.1020
// ladok2.kurser.ME.2053.antagna_20222
// ladok2.kurser.MF.2102.godkand
// ladok2.kurser.MF.2114
// ladok2.kurser.MF.2032.registrerade_20221.1
// ladok2.kurser.MF.2039.registrerade_20212.1
// ladok2.program.TIPDM.registrerade_20221
// ladok2.kurser.ÅF.2102.godkand
// ladok2.kurser.ÅF.210v.godkand

const courseTestCases: { [index: string]: TUserCourse } = {
  "ladok2.kurser.SE.1020": {
    type: "kurser",
    course_code: "SE1020",
  },
  "ladok2.kurser.ME.2053.antagna_20222": {
    type: "kurser",
    course_code: "ME2053",
    status: "antagna",
    year: 2022,
    term: "2",
  },
  "ladok2.kurser.MF.2102.godkand": {
    type: "kurser",
    course_code: "MF2102",
    status: "godkand",
  },
  "ladok2.kurser.MF.2114": {
    type: "kurser",
    course_code: "MF2114",
  },
  "ladok2.kurser.MF.2032.registrerade_20221.1": {
    type: "kurser",
    course_code: "MF2032",
    status: "registrerade",
    year: 2022,
    term: "1",
    round: "1",
  },
  "ladok2.kurser.MF.2039.registrerade_20212.1": {
    type: "kurser",
    course_code: "MF2039",
    status: "registrerade",
    year: 2021,
    term: "2",
    round: "1",
  },
  "ladok2.kurser.ÅF.2102.godkand": {
    type: "kurser",
    course_code: "ÅF2102",
    status: "godkand",
  },
  "ladok2.kurser.ÅF.210v.godkand": {
    type: "kurser",
    course_code: "ÅF210v",
    status: "godkand",
  },
  "ladok2.kurser.AA.1234.unknown": {
    type: "kurser",
    course_code: "AA1234",
    status: undefined,
  },
  "ladok2.kurser.AA.1234.unknown_20211": {
    type: "kurser",
    course_code: "AA1234",
    status: undefined,
    year: 2021,
    term: "1",
  },
};

// Those are not valid, must return null
const invalidTestCourses = [
  "ladok2....",
  "ladok2.kurser...",
  "ladok2.kurser..2022",
  "ladok2.kurser.AA.1234._20211",
];

const programmeTestCases: { [index: string]: TUserProgram } = {
  "ladok2.program.TIPDM.registrerade_20221": {
    type: "program",
    program_code: "TIPDM",
    status: "registrerade",
    year: 2022,
    term: "1",
  },
};

// Those are not valid, must return null
const invalidTestProgrammes = [
  "ladok2....",
  "ladok2.program...",
  "ladok2.program..2022",
  "ladok2.program.A._20211",
];

describe("UG REST API response should detect courses", () => {
  test.each(Object.keys(courseTestCases))("%s", (testCase) => {
    const expected = courseTestCases[testCase];
    const output = parseToUserCourse(testCase);
    expect(output).toStrictEqual(expected);
  });
});

describe("UG REST API response should not return non-course groups", () => {
  test.each(invalidTestCourses)("%s", (testCase) => {
    const output = parseToUserCourse(testCase);
    expect(output).toBeNull();
  });
});

describe("UG REST API response should detect programmes", () => {
  test.each(Object.keys(programmeTestCases))("%s", (testCase) => {
    const expected = programmeTestCases[testCase];
    const output = parseToUserProgram(testCase);

    expect(output).toStrictEqual(expected);
  });
});

describe("UG REST API response should not return non-course groups", () => {
  test.each(invalidTestProgrammes)("%s", (testCase) => {
    const output = parseToUserProgram(testCase);
    expect(output).toBeNull();
  });
});
