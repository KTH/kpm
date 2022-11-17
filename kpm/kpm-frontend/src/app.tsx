import * as React from "react";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { getRoutes } from "./routes";
import { Menu } from "./Menu";

import "./app.scss";

const IS_DEV = process.env.NODE_ENV !== "production";

export type TCurrentUser = {
  kthid: string,
  display_name: string,
  email: string,
  username: string,
  exp: number,
}

declare global {
  interface Window {
    __kpmCurrentUser__: TCurrentUser;
  }
}

export const currentUser: TCurrentUser = window.__kpmCurrentUser__ || (IS_DEV && { kthid: 'u19t0qf2', display_name: 'Sebastian Ware', email: 'jhsware@kth.se', username: 'jhsware', exp: 1668683814 })

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
