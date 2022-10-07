import * as React from 'react';
import {
  RouteObject,
} from "react-router-dom";
import { loaderProfile, Profile } from './panes/profile';
import { loaderStudies, Studies } from './panes/studies';
import { loaderTeaching, Teaching } from './panes/teaching';
import { Programme } from "./panes/programme";
import { Schedule } from "./panes/schedule";
import { Services } from "./panes/services";
import { Groups } from "./panes/groups";

const getRoutesDefaults = {
  hasTeaching: true,
  hasStudies: true,
}
export function getRoutes({ hasTeaching, hasStudies } = getRoutesDefaults): RouteObject[] {
  const routes = [
    {
      path: "/profile",
      element: <Profile />,
      loader: loaderProfile,
      nodeRef: React.createRef(),
    },
    hasTeaching && {
      path: "/schedule",
      element: <Schedule />,
      nodeRef: React.createRef(),
    },
    hasStudies && {
      path: "/studies",
      element: <Studies />,
      loader: loaderStudies,
      nodeRef: React.createRef(),
    },
    {
      path: "/teaching",
      element: <Teaching />,
      loader: loaderTeaching,
      nodeRef: React.createRef(),
    },
    {
      path: "/programme",
      element: <Programme />,
      nodeRef: React.createRef(),
    },
    {
      path: "/groups",
      element: <Groups />,
      nodeRef: React.createRef(),
    },
    {
      path: "/services",
      element: <Services />,
      nodeRef: React.createRef(),
    },
  ];

  return routes.filter((i) => i) as RouteObject[];
}
