import * as React from "react";
import { describe, expect, test, afterEach } from "@jest/globals";
import renderer from "react-test-renderer";
import { act } from "react-dom/test-utils";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { Services } from "../src/panes/services";
import { mockFetchJson, resetMockedFetch } from "fetch-for-jest";
import { APIServices } from "kpm-backend-interface";

describe("<Services />", () => {
  afterEach(() => {
    resetMockedFetch();
  });

  test("Can be rendered", () => {
    const routes = [{ path: "/", element: <Services /> }];
    const router = createMemoryRouter(routes, {
      initialEntries: ["/"],
      initialIndex: 1,
    });
    const component = renderer.create(<RouterProvider router={router} />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test("Can be rendered with data", async () => {
    mockFetchJson<APIServices>({
      servicelinks: [
        { name: "Test Service Link", url: "//:test/test/service" },
      ],
      studentlinks: [
        { name: "Test Student Link", url: "//:test/test/student" },
      ],
    });

    const routes = [{ path: "/", element: <Services /> }];
    const router = createMemoryRouter(routes, {
      initialEntries: ["/"],
      initialIndex: 1,
    });

    let component: any;
    await act(() => {
      component = renderer.create(<RouterProvider router={router} />);
    });

    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
