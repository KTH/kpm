import * as React from "react";
import { RouteObject } from "react-router-dom";
import { Profile } from "./panes/profile";
import { Studies } from "./panes/studies";
import { Teaching } from "./panes/teaching";
import { Programme } from "./panes/programme";
import { Schedule } from "./panes/schedule";
import { Services } from "./panes/services";
import { Groups } from "./panes/groups";

export function getRoutes(): RouteObject[] {
  const routes: RouteObject[] = [
    {
      path: "/profile",
      element: <Profile />,
    },
    {
      path: "/schedule",
      element: <Schedule />,
    },
    {
      path: "/studies",
      element: <Studies />,
    },
    {
      path: "/teaching",
      element: <Teaching />,
    },
    {
      path: "/programme",
      element: <Programme />,
    },
    {
      path: "/groups",
      element: <Groups />,
    },
    {
      path: "/services",
      element: <Services />,
    },
  ];

  return routes.filter((i) => i);
}
