import * as React from "react";
import { Outlet, useLocation, useNavigate, useNavigation } from "react-router-dom";
import { linkClassName } from "./components/utils";
import { MenuPaneBackdrop, MenuSpacer } from "./components/menu";
import { getRoutes } from './routes';
import { LoadingIndicator } from "./components/loading";
import { ToggleNavLink } from "./components/links";


export function Menu({ hasStudies, hasTeaching }: any) {
  const navigation = useNavigation();
  const location = useLocation();
  const navigate = useNavigate();

  const hasMatch: boolean =
    !!getRoutes().find((route) => route.path === location.pathname)

  return (
    <React.Fragment>
      <MenuPaneBackdrop visible={hasMatch} onClose={() => navigate("/")} />
      <nav className="kpm-menu">
        <ol>
          <li>
            <ToggleNavLink to="profile" className={linkClassName}>
              Profile
            </ToggleNavLink>
          </li>
          <li>
            <ToggleNavLink to="schedule" className={linkClassName}>
              Schedule
            </ToggleNavLink>
          </li>
          {hasStudies && (
            <li>
              <ToggleNavLink to="studies" className={linkClassName}>
                Studies
              </ToggleNavLink>
            </li>
          )}
          {hasTeaching && (
            <li>
              <ToggleNavLink to="teaching" className={linkClassName}>
                Teaching
              </ToggleNavLink>
            </li>
          )}
          <li>
            <ToggleNavLink to="programme" className={linkClassName}>
              Programme
            </ToggleNavLink>
          </li>
          <li>
            <ToggleNavLink to="groups" className={linkClassName}>
              Groups
            </ToggleNavLink>
          </li>
          <li>
            <ToggleNavLink to="services" className={linkClassName}>
              Services
            </ToggleNavLink>
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

