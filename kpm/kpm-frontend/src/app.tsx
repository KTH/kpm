import * as React from "react";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { getRoutes } from "./routes";
import { Menu } from "./Menu";

type TCreateRouterProps = {
  hasStudies: boolean;
  hasTeaching: boolean;
};

function createRouter({ ...props }: TCreateRouterProps) {
  return createHashRouter([
    {
      path: "/",
      element: <Menu {...props} />,
      children: getRoutes({ ...props }).map((route) => ({
        index: route.path === "/",
        path: route.path === "/" ? undefined : route.path,
        element: route.element,
        loader: route.loader,
      })),
    },
  ]);
}

export function App() {
  return (
    <RouterProvider
      router={createRouter({ hasStudies: true, hasTeaching: true })}
    />
  );
}
