import { beforeEach, describe, expect, test } from "@jest/globals";
import { getMockReq, getMockRes } from "@jest-mock/express";
import { api } from "../src/api";

describe("api middleware", () => {
  const { res, next, mockClear } = getMockRes();

  beforeEach(() => {
    mockClear();
  });

  test("/lang passes error to next", () => {
    api(getMockReq({ url: "http:///lang", method: "post" }), res, next);
    expect(next).toBeCalled();
  });

  test("/teaching passes error to next", () => {
    api(getMockReq({ path: "http:///teaching", method: "get" }), res, next);
    expect(next).toBeCalled();
  });

  test("/studies passes error to next", () => {
    api(getMockReq({ path: "http:///studies", method: "get" }), res, next);
    expect(next).toBeCalled();
  });

  test("/groups passes error to next", () => {
    api(getMockReq({ path: "http:///groups", method: "get" }), res, next);
    expect(next).toBeCalled();
  });

  test("/programmes passes error to next", () => {
    api(getMockReq({ path: "http:///programmes", method: "get" }), res, next);
    expect(next).toBeCalled();
  });

  test("/services passes error to next", () => {
    api(getMockReq({ path: "http:///services", method: "get" }), res, next);
    expect(next).toBeCalled();
  });

  test("/star passes error to next", () => {
    api(getMockReq({ path: "http:///star", method: "post" }), res, next);
    expect(next).toBeCalled();
  });

  test("/use_beta passes error to next", () => {
    api(getMockReq({ path: "http:///use_beta", method: "post" }), res, next);
    expect(next).toBeCalled();
  });
});
