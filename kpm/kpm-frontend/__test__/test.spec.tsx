import * as React from "react";
import { describe, expect, test } from "@jest/globals";
import renderer from "react-test-renderer";
import { App } from "../src/app";

describe("<App />", () => {
  test("Can be rendered", () => {
    const component = renderer.create(
      <App />,
    );
    
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});
