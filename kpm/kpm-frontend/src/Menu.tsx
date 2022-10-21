import * as React from "react";
import { NavLink, Outlet, useLocation, useNavigation } from "react-router-dom";
import { linkClassName } from "./components/utils";
import { MenuPaneBackdrop, MenuSpacer } from "./components/menu";
import { getRoutes } from './routes';
import { LoadingIndicator } from "./components/loading";


export function Menu({ hasStudies, hasTeaching }: any) {
  const navigation = useNavigation();
  const location = useLocation()

  const hasMatch: boolean =
    !!getRoutes().find((route) => route.path === location.pathname)

  return (
    <React.Fragment>
      <MenuPaneBackdrop visible={hasMatch} />
      <nav className="kpm-menu">
        <ol>
          <li>
            <NavLink to="profile" className={linkClassName}>
              Profile
            </NavLink>
          </li>
          <li>
            <NavLink to="schedule" className={linkClassName}>
              Schedule
            </NavLink>
          </li>
          {hasStudies && (
            <li>
              <NavLink to="studies" className={linkClassName}>
                Studies
              </NavLink>
            </li>
          )}
          {hasTeaching && (
            <li>
              <NavLink to="teaching" className={linkClassName}>
                Teaching
              </NavLink>
            </li>
          )}
          <li>
            <NavLink to="programme" className={linkClassName}>
              Programme
            </NavLink>
          </li>
          <li>
            <NavLink to="groups" className={linkClassName}>
              Groups
            </NavLink>
          </li>
          <li>
            <NavLink to="services" className={linkClassName}>
              Services
            </NavLink>
          </li>
          <MenuSpacer />
          <li>M</li>
          <li>D</li>
          <li>N</li>
        </ol>
        <LoadingIndicator isLoading={navigation.state === "loading"} />
      </nav>
      <Outlet />
    </React.Fragment>
  );
}
