import * as React from "react";
import { describe, expect, test, afterEach, beforeEach } from "@jest/globals";
import renderer from "react-test-renderer";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { Services } from "../src/panes/services";
import prettify from "pretty";
import { mockFetchJson, resetMockedFetch } from "./utils";
import { APIServices } from "kpm-backend-interface";

describe("<Services />", () => {
  let container: any;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    resetMockedFetch();
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  test("Can be rendered", () => {
    const component = renderer.create(<Services />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test("Can be rendered with data", async () => {
    mockFetchJson<APIServices>({
      servicelinks: [{ name: "Test Service Link", url: "//:test/test/service" }],
      studentlinks: [{ name: "Test Student Link", url: "//:test/test/student" }],
    });

    await act(() => {
      render(<Services />, container);
    })

    expect(prettify(container.innerHTML)).toMatchSnapshot();
  });
});
