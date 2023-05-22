import * as React from "react";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { useAuthState } from "./state/authState";
import { getRoutes, TRouterProps } from "./routes";
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

function createRouter({ ...props }: TRouterProps) {
  return createHashRouter([
    {
      element: <Menu />,
      errorElement: <Menu />,
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
  const [currentUser] = useAuthState();

  return (
    <ErrorBoundary>
      <RouterProvider
        router={createRouter({
          hasStudies: currentUser?.hasLadokCourses ?? false,
          hasTeaching: currentUser?.hasEduCourses ?? false,
        })}
      />
    </ErrorBoundary>
  );
}
