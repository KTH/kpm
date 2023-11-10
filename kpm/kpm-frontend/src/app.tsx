import * as React from "react";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { getRoutes } from "./routes";
import { Menu } from "./Menu";
import { ErrorBoundary } from "./error";

import "./app.scss";
import { TSessionUser } from "kpm-backend-interface";

const IS_DEV = process.env.NODE_ENV !== "production";

type TSettings = {
  lang?: string;
};

declare global {
  interface Window {
    __kpmCurrentUser__: TSessionUser | undefined;
    __kpmSettings__: TSettings;
  }
}

function createRouter() {
  return createHashRouter([
    {
      path: "/",
      element: <Menu />,
      errorElement: <Menu />,
      children: getRoutes().map((route) => ({
        path: route.path,
        element: route.element,
      })),
    },
  ]);
}

export function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={createRouter()} />
    </ErrorBoundary>
  );
}
