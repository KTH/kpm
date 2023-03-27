import assert from "node:assert/strict";
import express from "express";
import { UGRestClient, UGRestClientError } from "kpm-ug-rest-client";

const IS_DEV = process.env.NODE_ENV !== "production";

const OAUTH_SERVER_BASE_URI =
  process.env.OAUTH_SERVER_BASE_URI || "https://login.ref.ug.kth.se/adfs";
const CLIENT_ID = process.env.CLIENT_ID!; // Required in .env.in
const CLIENT_SECRET = process.env.CLIENT_SECRET!; // Required in .env.in
const UG_REST_BASE_URI =
  process.env.UG_REST_BASE_URI || "https://integral-api.sys.kth.se/test/ug";

export const api = express.Router();

api.get("/mine", (req, res, next) => {
  try {
    res.send({ msg: "Not implemented yet." });
  } catch (e: any) {
    next(e);
  }
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
  name: string;
};

api.get("/user/:user", async (req, res, next) => {
  try {
    const userName = req.params.user;

    const ugClient = new UGRestClient({
      authServerDiscoveryURI: OAUTH_SERVER_BASE_URI,
      resourceBaseURI: UG_REST_BASE_URI,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
    });

    // throw new Error("Test");

    const perf1 = Date.now();
    // TODO: Remove these, they are only part of our though process:
    // const { data, json, statusCode } = await ugClient.get<TUgUser>(`users/${userName}`);
    // const { data, json, statusCode } = await ugClient.get<TUgGroup[]>(`groups?$filter=members in ('${userName}')`);
    // const { data, json, statusCode } = await ugClient.get<TUgGroup[]>(`groups/${userName}`);
    // NOTE: The following combined filter is VERY slow
    // const { data, json, statusCode } = await ugClient.get<TUgGroup[]>(`groups?$filter=contains(members, '${userName}') and startswith(name, 'edu.courses.')`);
    // const { data, json, statusCode } = await ugClient.get<TUgGroup[]>(`groups?$filter=contains(members, '${userName}')`);

    const { data, json, statusCode } =
      (await ugClient
        .get<{ memberOf: TUgGroup[] }[]>(
          `users?$filter=kthid eq '${userName}'&$expand=memberOf`
        )
        .catch(ugClientGetErrorHandler)) || {};
    // console.debug(`Time to call UGRestClient(get): ${Date.now() - perf1}ms`);

    if (json === undefined || statusCode !== 200) {
      if (IS_DEV) {
        return res.status(statusCode || 500).send(data);
      } else {
        return res.status(statusCode || 500).send("error");
      }
    } else if (json.length === 0) {
      res.status(statusCode || 200).send([]);
    } else {
      const result = teachingResult(json[0]?.memberOf);
      res.status(statusCode || 200).send(result);
    }
  } catch (e: any) {
    next(e);
  }
});

export type Role = {
  role: string;
  year: string;
  term: string;
  round_id: string;
};

// Separate function for testability
export function teachingResult(data: TUgGroup[]): {
  [index: string]: Array<Role>;
} {
  if (data === undefined) return {};

  /* nameRegex regex test matches:
      Match: edu.courses.5B.5B1219.examiner
      No match: edu.courses.5B.5B1219.examiner.sdf
      Match: edu.courses.åäö.5B1219.examiner
      No match: edu.courses.€d.5B1219.teachers
      Match: edu.courses.BB.BB2165.20212.1.teachers
      Match: edu.courses.BB.BB2165.20212.1.courseresponsible
      Match: edu.courses.BB.BB2165.20212.1.assistants
      Match: edu.courses.BB.BB2165.20212.hjkfds23-hjk-234.assistants
      No match: edu.courses.BB.BB2165.20212..assistants
  */
  const nameRegex =
    /^edu\.courses\.[^.]+\.(?<course_code>[^.]+)\.((?<role>examiner)|(?<year>[0-9]{4})(?<term>[0-9])\.(?<round_id>[^.]+)\.(?<role_alt>teachers|courseresponsible|assistants))$/i;
  const result = data
    .map((o) => o.name.match(nameRegex)?.groups)
    .filter((o) => o)
    .map((o: any) => {
      const { role, role_alt, ...other } = o;
      return {
        ...other,
        role: role || role_alt,
      };
    });
  let courses: { [index: string]: Array<Role> } = {};
  for (const { course_code, ...role } of result) {
    if (courses[course_code]) {
      courses[course_code].push(role);
    } else {
      courses[course_code] = [role];
    }
  }
  return courses;
}

function ugClientGetErrorHandler(err: any) {
  if (err instanceof UGRestClientError) {
    throw err;
  }

  Error.captureStackTrace(err, ugClientGetErrorHandler);
  throw err;
}
