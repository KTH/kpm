import { describe, expect, jest, test } from "@jest/globals";
import {
  convertToCourseObjects,
  convertToProgrammeObjects,
  TUserCourse,
  TUserProgram,
} from "../src/apiUtils";

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
    code: "SE1020",
  },
  "ladok2.kurser.ME.2053.antagna_20222": {
    type: "kurser",
    code: "ME2053",
    status: "antagna",
    year: 2022,
    term: "2",
  },
  "ladok2.kurser.MF.2102.godkand": {
    type: "kurser",
    code: "MF2102",
    status: "godkand",
  },
  "ladok2.kurser.MF.2114": {
    type: "kurser",
    code: "MF2114",
  },
  "ladok2.kurser.MF.2032.registrerade_20221.1": {
    type: "kurser",
    code: "MF2032",
    status: "registrerade",
    year: 2022,
    term: "1",
    round: "1",
  },
  "ladok2.kurser.MF.2039.registrerade_20212.1": {
    type: "kurser",
    code: "MF2039",
    status: "registrerade",
    year: 2021,
    term: "2",
    round: "1",
  },
  "ladok2.kurser.ÅF.2102.godkand": {
    type: "kurser",
    code: "ÅF2102",
    status: "godkand",
  },
  "ladok2.kurser.ÅF.210v.godkand": {
    type: "kurser",
    code: "ÅF210v",
    status: "godkand",
  },
};

const programmeTestCases: { [index: string]: TUserProgram } = {
  "ladok2.program.TIPDM.registrerade_20221": {
    type: "program",
    code: "TIPDM",
    status: "registrerade",
    year: 2022,
    term: "1",
  },
};

describe("UG REST API response should detect courses", () => {
  for (const testCase of Object.keys(courseTestCases)) {
    test(testCase, () => {
      const tmp = convertToCourseObjects([testCase]);
      const res = JSON.parse(JSON.stringify(tmp[0]));
      expect(res).toStrictEqual(courseTestCases[testCase]);
    });
  }
});

describe("UG REST API response should detect programmes", () => {
  for (const testCase of Object.keys(programmeTestCases)) {
    test(testCase, () => {
      const tmp = convertToProgrammeObjects([testCase]);
      const res = JSON.parse(JSON.stringify(tmp[0]));
      expect(res).toStrictEqual(programmeTestCases[testCase]);
    });
  }
});
