import { describe, expect, jest, test } from "@jest/globals";
import { UGRestClient } from "../src/ugRestClient";
import { addMockResponse } from "../__mocks__/openid-client";

jest.mock("openid-client");

addMockResponse("UG_REST_BASE_URI/users/json", {
  headers: {},
  method: "GET",
  statusCode: 200,
  statusMessage: "ok",
  url: "/user/json",
  body: Buffer.from('{"msg":"ok"}'),
});
addMockResponse("UG_REST_BASE_URI/users/text", {
  headers: {},
  method: "GET",
  statusCode: 200,
  statusMessage: "ok",
  url: "/user/txt",
  body: Buffer.from(""),
});

describe("UgRestClient", () => {
  test("can get a JSON response", async () => {
    const ugClient = new UGRestClient({
      authServerDiscoveryURI: "OAUTH_SERVER_BASE_URI",
      resourceBaseURI: "UG_REST_BASE_URI",
      clientId: "CLIENT_ID",
      clientSecret: "CLIENT_SECRET",
    });
    const { data, json, statusCode } = await ugClient.get(`users/json`);

    expect(statusCode).toBe(200);
    expect(data).toBe('{"msg":"ok"}');
    expect(JSON.stringify(json)).toEqual('{"msg":"ok"}');
  });

  test("can get a text response", async () => {
    const ugClient = new UGRestClient({
      authServerDiscoveryURI: "OAUTH_SERVER_BASE_URI",
      resourceBaseURI: "UG_REST_BASE_URI",
      clientId: "CLIENT_ID",
      clientSecret: "CLIENT_SECRET",
    });
    const { data, json, statusCode } = await ugClient.get(`users/text`);

    expect(statusCode).toBe(200);
    expect(data).toBe("");
    expect(json).toBeUndefined();
  });
});
