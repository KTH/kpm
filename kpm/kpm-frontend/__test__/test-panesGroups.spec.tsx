import * as React from "react";
import { describe, expect, test, afterEach } from "@jest/globals";
import renderer from "react-test-renderer";
import { act } from "react-dom/test-utils";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { Groups } from "../src/panes/groups";
import { mockFetchJson, resetMockedFetch } from "fetch-for-jest";
import { APIGroups } from "kpm-backend-interface";

describe("<Groups />", () => {
  afterEach(() => {
    resetMockedFetch();
  });

  test("Can be rendered", () => {
    const routes = [{ path: "/", element: <Groups /> }];
    const router = createMemoryRouter(routes, {
      initialEntries: ["/"],
      initialIndex: 1,
    });
    const component = renderer.create(<RouterProvider router={router} />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  test("Can be rendered with data and none starred", async () => {
    mockFetchJson<APIGroups>({
      groups: [
        {
          name: "Test Group 1",
          url: "//:test/group_1",
          slug: "test_group_1",
          starred: false,
        },
        {
          name: "Test Group 2",
          url: "//:test/group_2",
          slug: "test_group_2",
          starred: false,
        },
      ],
      group_search_url: "https://",
    });

    const routes = [{ path: "/", element: <Groups /> }];
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

  test("Can be rendered with data and one starred", async () => {
    mockFetchJson<APIGroups>({
      groups: [
        {
          name: "Test Group 1 starred",
          url: "//:test/group_1",
          slug: "test_group_1_starred",
          starred: true,
        },
        {
          name: "Test Group 2 not starred",
          url: "//:test/group_2",
          slug: "test_group_2",
          starred: false,
        },
      ],
      group_search_url: "https://",
    });

    const routes = [{ path: "/", element: <Groups /> }];
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
