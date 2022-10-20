import { describe, expect, jest, test } from "@jest/globals";
import {
  errorHandler,
  loggingHandler,
  uncaughtExceptionCallback,
} from "../src";

describe("API", () => {
  test("errorHandler exists", async () => {
    expect(errorHandler).toBeDefined();
  });
  test("loggingHandler exists", async () => {
    expect(loggingHandler).toBeDefined();
  });
  test("uncaughtExceptionCallback exists", async () => {
    expect(uncaughtExceptionCallback).toBeDefined();
  });
});
