import { beforeEach, describe, expect, test } from "@jest/globals";
import { getMockReq, getMockRes } from "@jest-mock/express";
import { auth } from "../src/auth";

describe("auth middleware", () => {
  const { res, next, mockClear } = getMockRes();

  beforeEach(() => {
    mockClear();
  });

  test("/login passes error to next", () => {
    auth(getMockReq({ url: "http:///login", method: "get" }), res, next);
    expect(next).toBeCalled();
  });

  test("/callback passes error to next", () => {
    auth(getMockReq({ path: "http:///callback", method: "get" }), res, next);
    expect(next).toBeCalled();
  });
});
