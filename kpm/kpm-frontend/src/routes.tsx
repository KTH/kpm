import * as React from "react";
import { RouteObject } from "react-router-dom";
import { loaderProfile, Profile } from "./panes/profile";
import { loaderStudies, Studies } from "./panes/studies";
import { loaderTeaching, Teaching } from "./panes/teaching";
import { Programme } from "./panes/programme";
import { Schedule } from "./panes/schedule";
import { Services } from "./panes/services";
import { Groups } from "./panes/groups";

const getRoutesDefaults = {
  hasTeaching: true,
  hasStudies: true,
};
export function getRoutes({
  hasTeaching,
  hasStudies,
} = getRoutesDefaults): RouteObject[] {
  const routes = [
    {
      path: "/profile",
      element: <Profile />,
      // loader: loaderProfile,
    },
    hasTeaching && {
      path: "/schedule",
      element: <Schedule />,
    },
    hasStudies && {
      path: "/studies",
      element: <Studies />,
      // loader: loaderStudies,
    },
    {
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
