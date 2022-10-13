import assert from 'node:assert/strict';
import express from "express";
import { UGRestClient } from "./ugRestClient";
import { convertToCourseObjects, convertToProgrammeObjects, getListOfCourseProgrammeNames } from './apiUtils';

const IS_DEV = process.env.NODE_ENV !== "production";
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const OAUTH_SERVER_BASE_URI = process.env.OAUTH_SERVER_BASE_URI || "https://login.ref.ug.kth.se/adfs";
const UG_REST_BASE_URI = process.env.UG_REST_BASE_URI || "https://integral-api.sys.kth.se/test/ug";

assert(typeof CLIENT_ID === "string" && CLIENT_ID, "Missing CLIENT_ID for OpenID auth");
assert(typeof CLIENT_SECRET === "string" && CLIENT_SECRET, "Missing CLIENT_SECRET for OpenID auth");

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
  affiliations: string[],
  givenName: string,
  kthid: string,
  memberOf: string,
  primaryAffiliation: string,
  surname: string,
  username: string,
}

export type TUgGroup = {
  description: {
    sv: string,
    en: string
  },
  kthid: string,
  name: string,
}

api.get("/user/:user", async (req, res) => {
  const userName = req.params.user;

  const ugClient = new UGRestClient({
    authServerDiscoveryURI: OAUTH_SERVER_BASE_URI,
    resourceBaseURI: UG_REST_BASE_URI,
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET
  })

  const perf1 = Date.now();

  const { data, json, statusCode } = await ugClient.get<TUgGroup[]>(`groups?$filter=contains(members, '${userName}')`);
  console.log(`Exec time: ${Date.now() - perf1}ms`)

  if (json === undefined || statusCode !== 200) {
    if (IS_DEV) {
      return res.status(statusCode || 500).send(data);
    }
  }

  const { courseNames, programmeNames } = getListOfCourseProgrammeNames(json!.map(o => o.name));

  res.status(statusCode || 200).send({
    courses: convertToCourseObjects(courseNames),
    programmes: convertToProgrammeObjects(programmeNames),
  });
});
