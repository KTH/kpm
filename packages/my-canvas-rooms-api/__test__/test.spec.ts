import { describe, expect, test } from "@jest/globals";

describe("de nice", () => {
  test("adds 1 + 2 to equal 3", () => {
    expect(1 + 2).toBe(3);
  });

  test("adds 1 + 3 to equal 4", () => {
    expect(1 + 3).toBe(4);
  });
});
