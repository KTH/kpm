import * as React from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
  useNavigation,
} from "react-router-dom";
import { formatDisplayName, linkClassName } from "./components/utils";
import { MenuPaneBackdrop } from "./components/menu";
import { getRoutes } from "./routes";
import { LoadingIndicator } from "./components/loading";
import { ToggleNavLink } from "./components/links";
import { i18n } from "./i18n/i18n";
import { IconMail, IconNewsfeed, IconNotifications } from "./components/icons";
import { RefObject, useEffect, useRef } from "react";
import "./Menu.scss";
import { LoginModal, useLogin } from "./components/login";
import { useAuthState } from "./state/authState";

const KTH_MAIL_URI = "https://webmail.kth.se/";
const KTH_SOCIAL_SUBSCRIPTIONS_URI =
  "https://www.kth.se/social/home/subscriptions/";
const KTH_SOCIAL_NOTIFICATIONS_URI =
  "https://www.kth.se/social/home/personal-menu/notifications/";

export function Menu({ hasStudies, hasTeaching }: any) {
  const navigation = useNavigation();
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  // Update CSS --kpm-bar-height
  useSetKpmBarHeight(menuRef);

  const [showLogin, setShowLogin] = useLogin();
  const [currentUser] = useAuthState();

  const hasMatch: boolean = !!getRoutes().find(
    (route) => route.path === location.pathname
  );

  return (
    <React.Fragment>
      <MenuPaneBackdrop visible={hasMatch} onClose={() => navigate("/")} />
      <nav ref={menuRef} className="kpm-menu">
        <ul>
          <li className="kpm-profile-item">
            <ToggleNavLink to="profile" className={linkClassName}>
              <img
                src={`https://www.kth.se/files/thumbnail/${currentUser?.username}`}
                alt="Profile Image"
                className="kpm-profile-image"
              />
              {currentUser ? formatDisplayName(currentUser.display_name) : ""}
            </ToggleNavLink>
          </li>
          <li className="kpm-schedule-item">
            <a href="https://www.kth.se/social/home/calendar/">
              {i18n("Schedule")}…
            </a>
            {/* <ToggleNavLink to="schedule" className={linkClassName}>
              {i18n("Schedule")}
            </ToggleNavLink> */}
          </li>
          {hasStudies && (
            <li>
              <ToggleNavLink to="studies" className={linkClassName}>
                {i18n("Studies")}
              </ToggleNavLink>
            </li>
          )}
          {hasTeaching && (
            <li>
              <ToggleNavLink to="teaching" className={linkClassName}>
                {i18n("Teaching")}
              </ToggleNavLink>
            </li>
          )}
          <li>
            <ToggleNavLink to="programme" className={linkClassName}>
              {i18n("Programme")}
            </ToggleNavLink>
          </li>
          <li>
            <ToggleNavLink to="groups" className={linkClassName}>
              {i18n("Groups")}
            </ToggleNavLink>
          </li>
          <li>
            <ToggleNavLink to="services" className={linkClassName}>
              {i18n("Services")}
            </ToggleNavLink>
          </li>
          <div className="kpm-menu-shotcuts">
            <li>
              <IconMail href={KTH_MAIL_URI} />
            </li>
            <li>
              <IconNewsfeed href={KTH_SOCIAL_SUBSCRIPTIONS_URI} />
            </li>
            <li>
              <IconNotifications href={KTH_SOCIAL_NOTIFICATIONS_URI} />
            </li>
          </div>
        </ul>
        <LoadingIndicator isLoading={navigation.state === "loading"} />
      </nav>
      <Outlet />
      {/* <LoginModal show={showLogin} onDismiss={() => setShowLogin(false)} /> */}
    </React.Fragment>
  );
}

function useSetKpmBarHeight(menuRef: RefObject<HTMLElement | null>) {
  // We check the size of the menu on each animation frame because this
  // is more robust than listening to resize events. We only write if
  // there was a change in order to avoid layout updates.
  const requestAnimFrameRef = useRef(0); // Do we really need a ref here? perhaps due to useEffect at bottom.
  let currentHeight = 0;

  const calculate = () => {
    // Update the kpm bar height
    const menuHeight = menuRef.current?.clientHeight ?? 0;
    if (currentHeight !== menuHeight) {
      currentHeight = menuHeight;
      document.documentElement.style.setProperty(
        "--kpm-bar-height",
        menuHeight + "px"
      );
    }

    requestAnimFrameRef.current = requestAnimationFrame(calculate);
  };

  // Continue polling until unmounted
  useEffect(() => {
    requestAnimFrameRef.current = requestAnimationFrame(calculate);
    return () => cancelAnimationFrame(requestAnimFrameRef.current);
  }, []);
}
