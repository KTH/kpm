import * as React from "react";
import { describe, expect, test } from "@jest/globals";
import renderer from "react-test-renderer";
import { Profile } from "../src/panes/profile";

describe("<Profile />", () => {
  test("Can be rendered", () => {
    const component = renderer.create(<Profile />);

    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
