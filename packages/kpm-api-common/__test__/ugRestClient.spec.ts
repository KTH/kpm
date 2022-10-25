import { describe, expect, test } from "@jest/globals";
import { errorHandler, loggingHandler } from "../src";

describe("API", () => {
  test("errorHandler exists", async () => {
    expect(errorHandler).toBeDefined();
  });
  test("loggingHandler exists", async () => {
    expect(loggingHandler).toBeDefined();
  });
});
