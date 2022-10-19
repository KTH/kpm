import assert from "node:assert/strict";
import express from "express";
import { UGRestClient } from "kpm-ug-rest-client";

const IS_DEV = process.env.NODE_ENV !== "production";

const OAUTH_SERVER_BASE_URI =
  process.env.OAUTH_SERVER_BASE_URI || "https://login.ref.ug.kth.se/adfs";
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const UG_REST_BASE_URI =
  process.env.UG_REST_BASE_URI || "https://integral-api.sys.kth.se/test/ug";

assert(
  typeof CLIENT_ID === "string" && CLIENT_ID,
  "Missing CLIENT_ID for OpenID auth"
);
assert(
  typeof CLIENT_SECRET === "string" && CLIENT_SECRET,
  "Missing CLIENT_SECRET for OpenID auth"
);

export const api = express.Router();

api.get("/", (req, res) => {
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

api.get("/user/:user", async (req, res, next) => {
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

  const { data, json, statusCode } = await ugClient.get<TUgGroup[]>(
    `groups?$filter=contains(members, '${userName}')`
  );
  console.log(`Exec time: ${Date.now() - perf1}ms`);

  if (json === undefined || statusCode !== 200) {
    if (IS_DEV) {
      return res.status(statusCode || 500).send(data);
    }
  }

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
  const result = json
    ?.map((o) => o.name.match(nameRegex)?.groups)
    .filter((o) => o)
    .map((o: any) => {
      const { role, role_alt, ...other } = o;
      return {
        ...other,
        role: role || role_alt,
      };
    });

  res.status(statusCode || 200).send(result);
});
