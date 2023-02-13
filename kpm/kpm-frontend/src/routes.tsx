import * as React from "react";
import { RouteObject } from "react-router-dom";
import { Profile } from "./panes/profile";
import { Studies } from "./panes/studies";
import { Teaching } from "./panes/teaching";
import { Programme } from "./panes/programme";
import { Schedule } from "./panes/schedule";
import { Services } from "./panes/services";
import { Groups } from "./panes/groups";

export type TRouterProps = {
  hasStudies: boolean;
  hasTeaching: boolean;
  numNewNotifications: number;
};

const getRoutesDefaults = {
  hasTeaching: true,
  hasStudies: true,
  numNewNotifications: 0,
};
export function getRoutes({
  hasTeaching,
  hasStudies,
}: TRouterProps = getRoutesDefaults): RouteObject[] {
  const routes = [
    {
      path: "/profile",
      element: <Profile />,
      // loader: loaderProfile,
    },
    {
      path: "/schedule",
      element: <Schedule />,
    },
    hasStudies && {
      path: "/studies",
      element: <Studies />,
      // loader: loaderStudies,
    },
    hasTeaching && {
      path: "/teaching",
      element: <Teaching />,
      // loader: loaderTeaching,
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

  return routes.filter((i) => i) as RouteObject[];
}
