/* Top-level source file for my-teaching-api */
import "./config";
import assert from 'node:assert/strict';
import express from "express";
import { UGRestClient } from "./ugRestClient";

const IS_DEV = process.env.NODE_ENV !== "production";

const OAUTH_SERVER_BASE_URI = process.env.OAUTH_SERVER_BASE_URI || "https://login.ref.ug.kth.se/adfs";
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const UG_REST_BASE_URI = process.env.UG_REST_BASE_URI || "https://integral-api.sys.kth.se/test/ug";

assert(typeof CLIENT_ID === "string" && CLIENT_ID, "Missing CLIENT_ID for OpenID auth");
assert(typeof CLIENT_SECRET === "string" && CLIENT_SECRET, "Missing CLIENT_SECRET for OpenID auth");

const app = express();
const port = parseInt(process.env.PORT || "3000");
const prefix = process.env.PROXY_PATH_PREFIX || "/kpm/studies";

const api = express.Router();

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

app.use((req, res, next) => {
  next();
  console.log(`${req.path} => ${res.statusCode}`);
});
app.use(prefix, api);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

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
  const splitRegex = /^ladok2\.(?<type>[^\.]*)\./i;
  const courseNames: string[] = [];
  const programmeNames: string[] = [];
  inp.forEach(name => {
    const tmp = name.match(splitRegex)?.groups;
    if (tmp?.type === "kurser") {
      return courseNames.push(name);
    }
    if (tmp?.type === "program") {
      return programmeNames.push(name)
    }
  });

  return {
    courseNames,
    programmeNames,
  }
}

export function convertToCourseObjects(inp: string[]) {
  const courseRegex = /^ladok2\.(?<type>kurser)\.(?<code_pt1>[^\.]*)\.(?<code_pt2>[^\.]*)(\.(?<cstatus>[^\._]*)(_(?<cyear>\d{4})(?<cterm>\d{1})(\.(?<cterm_pt2>\d{1}))?)?)?$/i;
  const tmpJson = inp?.map(o => o.match(courseRegex)?.groups).filter(o => o && o.type === "kurser");
  return tmpJson?.map((o: any) => {
    const { type, code_pt1, code_pt2, cstatus, cyear, cterm, cterm_pt2 } = o;
    return {
      type,
      code: `${code_pt1}${code_pt2}`,
      code_pt1,
      code_pt2,
      status: cstatus,
      year: cyear,
      term: cterm,
      round: cterm_pt2 // QUESTION: Is this really round id or perhaps section or something similar? Matches the last number of "registrerade_20221.1"
    }
  });
}

export function convertToProgrammeObjects(inp: string[]) {
  const progrRegex = /^ladok2\.(?<type>program)\.(?<code_pt1>[^\.]*)\.((?<pstatus>[^\._]*)_(?<pyear>\d{4})(?<pterm>\d{1}))$/i;
  const tmpJson = inp?.map(o => o.match(progrRegex)?.groups).filter(o => o && o.type === "program");
  return tmpJson?.map((o: any) => {
    const { type, code_pt1, pstatus, pyear, pterm } = o;
    return {
      type,
      code: code_pt1,
      status: pstatus,
      year: pyear,
      term: pterm
    }
  });
}