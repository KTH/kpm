import assert from "node:assert/strict";
import express from "express";
import { UGRestClient } from "kpm-ug-rest-client";
import {
  convertToCourseObjects,
  convertToProgrammeObjects,
  getListOfCourseProgrammeNames,
  TCourseCode,
  TProgramCode,
  TUserCourse,
  TUserProgram,
} from "./apiUtils";

const IS_DEV = process.env.NODE_ENV !== "production";
const CLIENT_ID = process.env.CLIENT_ID!; // Required in .env.in
const CLIENT_SECRET = process.env.CLIENT_SECRET!; // Required in .env.in
const OAUTH_SERVER_BASE_URI =
  process.env.OAUTH_SERVER_BASE_URI || "https://login.ref.ug.kth.se/adfs";
const UG_REST_BASE_URI =
  process.env.UG_REST_BASE_URI || "https://integral-api.sys.kth.se/test/ug";

export const api = express.Router();

api.get("/", (_req, res) => {
  res.send({ msg: "Hello World!!!" });
});
api.get("/_monitor", (_req, res) => {
  res.send("APPLICATION_STATUS: OK");
});

api.get("/mine", (req, res) => {
  res.send({ msg: "Not implemented yet." });
});

// Expected values from UG
export type TUgUser = {
  affiliations: string[];
  givenName: string;
  kthid: string;
  memberOf: string;
  primaryAffiliation: string;
  surname: string;
  username: string;
};

export type TUgGroup = {
  description: {
    sv: string;
    en: string;
  };
  kthid: string;
  name: string;
};

export type TUserStudies = {
  courses: Record<TCourseCode, TUserCourse[]>;
  programmes: Record<TProgramCode, TUserProgram[]>;
};

api.get("/user/:user", async (req, res: express.Response<TUserStudies>) => {
  try {
    const userName = req.params.user;

    const ugClient = new UGRestClient({
      authServerDiscoveryURI: OAUTH_SERVER_BASE_URI,
      resourceBaseURI: UG_REST_BASE_URI,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
    });

    const perf1 = Date.now();

    const { data, json, statusCode } = await ugClient.get<
      { memberOf: TUgGroup[] }[]
    >(`users?$filter=kthid eq '${userName}'&$expand=memberOf`);
    console.log(`Exec time: ${Date.now() - perf1}ms`);

    if (json === undefined || statusCode !== 200) {
      if (IS_DEV) {
        return res.status(statusCode || 500).send(data as any);
      }
    }

    const { courseNames, programmeNames } = getListOfCourseProgrammeNames(
      json![0].memberOf.map((o) => o.name)
    );

    let courses: { [index: TCourseCode]: TUserCourse[] } = {};
    for (const obj of convertToCourseObjects(courseNames)) {
      let course_code = obj.course_code;
      if (courses[course_code]) {
        courses[course_code].push(obj);
      } else {
        courses[course_code] = [obj];
      }
    }
    let programmes: { [index: TProgramCode]: TUserProgram[] } = {};
    for (const obj of convertToProgrammeObjects(programmeNames)) {
      let program_code = obj.program_code;
      if (programmes[program_code]) {
        programmes[program_code].push(obj);
      } else {
        programmes[program_code] = [obj];
      }
    }

    res.status(statusCode || 200).send({
      courses,
      programmes,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Error" as any);
  }
});
