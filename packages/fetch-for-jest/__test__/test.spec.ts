import * as React from "react";
import { describe, expect, test, afterEach } from "@jest/globals";
import { mockFetchJson, resetMockedFetch } from "../src/index";

type TTest = {
  name: string,
  number: number,
}

describe("fetch", () => {
  afterEach(() => {
    resetMockedFetch();
  });

  test("Can be called", async () => {
    const input = {
      name: "test",
      number: 23,
    };

    mockFetchJson<TTest>(input);

    const res = await fetch("/test");
    const data = await res.json();

    expect(data).toStrictEqual(input);
  });
});
