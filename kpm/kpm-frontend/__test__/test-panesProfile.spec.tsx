import * as React from "react";
import { describe, expect, test } from "@jest/globals";
import renderer from "react-test-renderer";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { Profile } from "../src/panes/profile";

describe("<Profile />", () => {
  test("Can be rendered", () => {
    const routes = [{ path: "/", element: <Profile /> }];
    const router = createMemoryRouter(routes, {
      initialEntries: ["/"],
      initialIndex: 1,
    });
    const component = renderer.create(<RouterProvider router={router} />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
