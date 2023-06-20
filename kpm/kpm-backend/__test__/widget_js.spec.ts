import { beforeEach, describe, expect, test } from "@jest/globals";
import { getMockReq, getMockRes } from "@jest-mock/express";
import { widgetJsHandler } from "../src/widget.js";

describe("widget.js handler", () => {
  const { res, next, mockClear } = getMockRes();

  beforeEach(() => {
    mockClear();
  });

  test("/kpm.js passes error to next", () => {
    widgetJsHandler(
      getMockReq({ url: "http:///login", method: "get" }),
      res,
      next
    );
    expect(next).toBeCalled();
  });
});
