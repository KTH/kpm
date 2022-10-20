import { describe, expect, jest, test } from "@jest/globals";
import { UGRestClient } from "kpm-ug-rest-client";
import { TUgUser, teachingResult } from "../src/api";
import { addMockResponse } from "../__mocks__/openid-client";

jest.mock("openid-client");

addMockResponse("UG_REST_BASE_URI/users/dummy", {
  headers: {},
  method: "GET",
  statusCode: 200,
  statusMessage: "ok",
  url: "/user/dummy",
  body: Buffer.from(
    '{"affiliations":["employee","faculty","member","staff"],"givenName":"Lärare","kthid":"u1czoysx","kthidAliases":["u1czoysx"],"memberOf":["u20fjvcw","u21fwgap","u22foqs8","u238o9gg","u23ypc1o","u24427bs","u24e0hbj","u24qypqy","u25532jo","u25vzowc","u272lpvm","u28iqbjd","u28wie8y","u291yef9","u2aqxpr4","u2aw17ke","u2b56kjc","u2b6tm4a","u2c6kyie","u2h165ga","u2h6jhed","u2hwwd7e","u2ietaiz","u2ipjizn","u2k2k3gl","u2ka1i2u","u2kgcrnw","u2l3wwa4","u2medh4o","u2muk1hd","u2oosflj","u2plbh9l","u2rp81a5","u2twa58k","u2vkovak","u2wec713","u2wlrdgn","u2xht4hm"],"primaryAffiliation":"staff","surname":"Lärarsdotter","username":"abc"}'
  ),
});

describe("Dummy UG REST API response", () => {
  test("works", async () => {
    const ugClient = new UGRestClient({
      authServerDiscoveryURI: "OAUTH_SERVER_BASE_URI",
      resourceBaseURI: "UG_REST_BASE_URI",
      clientId: "CLIENT_ID",
      clientSecret: "CLIENT_SECRET",
    });
    const resp = await ugClient.get<TUgUser>(`users/dummy`);
    const { json } = resp;

    expect(json?.affiliations.find((e) => "employee")).toBe("employee");
  });
});

describe("Convert UG grops to course roles", () => {
  test("Basic examples", async () => {
    const groups = [
      { name: "edu.courses.5B.5B1219.examiner" },
      { name: "edu.courses.5B.5B1219.examiner.sdf", comment: "No match" },
      { name: "edu.courses.åäö.ÅÄ1219.examiner" },
      { name: "edu.courses.€d.5B1219.teachers", comment: "No match" },
      { name: "edu.courses.BB.BB2165.20212.1.teachers" },
      { name: "edu.courses.BB.BB2165.20212.1.courseresponsible" },
      { name: "edu.courses.BB.BB2165.20212.1.assistants" },
      { name: "edu.courses.BB.BB2165.20212.hjkfds23 - hjk - 234.assistants" },
      { name: "edu.courses.BB.BB2165.20212..assistants", comment: "No match" },
    ];
    expect(teachingResult(groups)).toStrictEqual({
      "5B1219": [
        {
          role: "examiner",
          round_id: undefined,
          term: undefined,
          year: undefined,
        },
      ],
      ÅÄ1219: [
        {
          role: "examiner",
          round_id: undefined,
          term: undefined,
          year: undefined,
        },
      ],
      BB2165: [
        {
          role: "teachers",
          round_id: "1",
          term: "2",
          year: "2021",
        },
        {
          role: "courseresponsible",
          round_id: "1",
          term: "2",
          year: "2021",
        },
        {
          role: "assistants",
          round_id: "1",
          term: "2",
          year: "2021",
        },
        {
          role: "assistants",
          round_id: "hjkfds23 - hjk - 234",
          term: "2",
          year: "2021",
        },
      ],
    });
  });
});
