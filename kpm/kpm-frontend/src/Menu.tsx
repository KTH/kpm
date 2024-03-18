import * as React from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
  useNavigation,
} from "react-router-dom";
import { linkClassName } from "./components/utils";
import { MenuPaneBackdrop } from "./components/menu";
import { getRoutes } from "./routes";
import { LoadingIndicator } from "./components/loading";
import { ToggleNavLink } from "./components/links";
import { i18n } from "./i18n/i18n";
import { IconMail, IconNewsfeed, IconNotifications } from "./components/icons";
import { RefObject, useEffect, useRef, useState } from "react";
import "./Menu.scss";
import { useLogin } from "./components/login";
import { useAuthState } from "./state/authState";
import { createApiUri, createFilesUri } from "./panes/utils";

const KTH_MAIL_URI = "https://webmail.kth.se/";
const KTH_SOCIAL_SUBSCRIPTIONS_URI =
  "https://www.kth.se/social/home/subscriptions/";
const KTH_SOCIAL_NOTIFICATIONS_URI =
  "https://www.kth.se/social/notifications/notice_list/";

let menuIsOpen: boolean | undefined;
function useMenuState(defaultOpen: boolean) {
  // Only set default on first render
  if (menuIsOpen === undefined) {
    menuIsOpen = defaultOpen;
  }

  const [_isOpen, setIsOpen] = useState(menuIsOpen);
  const setMenuIsOpen = (state: boolean) => {
    menuIsOpen = state;
    setIsOpen(menuIsOpen);
  };
  return [menuIsOpen, setMenuIsOpen] as const;
}

export function Menu() {
  const navigation = useNavigation();
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  // Update CSS --kpm-bar-height
  useSetKpmBarHeight(menuRef);

  const [isOpen, setIsOpen] = useMenuState(
    location.pathname.startsWith("/") && location.pathname.length > 1
  );
  const [showLogin, setShowLogin] = useLogin();
  const [currentUser] = useAuthState();

  const hasMatch: boolean = !!getRoutes().find(
    (route) => route.path === location.pathname
  );

  const hasStudies = currentUser?.hasLadokCourses ?? false;
  const hasTeaching = currentUser?.hasEduCourses ?? false;
  const numNewNotifications = currentUser?.numNewNotifications;

  let cls = "kpm-menu";
  if (isOpen) {
    cls += " active";
  }

  return (
    <React.Fragment>
      <MenuPaneBackdrop visible={hasMatch} onClose={() => navigate(-1)} />
      <nav ref={menuRef} className={cls}>
        <ul>
          <li className="kpm-mobile-menu kpm-mobile">
            <a
              onClick={(e: any) => {
                e.preventDefault();
                setIsOpen(!isOpen);
              }}
              className="kth-menu-item dropdown"
            >
              <img
                src={createFilesUri(`/thumbnail/${currentUser?.username}`)}
                alt=""
                className="kpm-profile-image"
              />
              <span>{i18n("Personal menu")}</span>
            </a>
          </li>

          <li className="kpm-schedule-item">
            <a
              href="https://www.kth.se/social/home/calendar/"
              className="kth-menu-item"
            >
              {i18n("Schedule")}
            </a>
            {/* <ToggleNavLink to="schedule" className={linkClassName}>
              {i18n("Schedule")}
            </ToggleNavLink> */}
          </li>
          {hasStudies && (
            <li>
              <ToggleNavLink
                id="kpmMenuStudies"
                to="studies"
                className={linkClassName}
              >
                <span>{i18n("Studies")}</span>
              </ToggleNavLink>
            </li>
          )}
          {hasTeaching && (
            <li>
              <ToggleNavLink
                id="kpmMenuTeaching"
                to="teaching"
                className={linkClassName}
              >
                <span>{i18n("Teaching")}</span>
              </ToggleNavLink>
            </li>
          )}
          <li>
            <ToggleNavLink
              id="kpmMenuProgramme"
              to="programme"
              className={linkClassName}
            >
              <span>{i18n("Programme")}</span>
            </ToggleNavLink>
          </li>
          <li>
            <ToggleNavLink
              id="kpmMenuGroups"
              to="groups"
              className={linkClassName}
            >
              <span>{i18n("Groups")}</span>
            </ToggleNavLink>
          </li>
          <li>
            <ToggleNavLink
              id="kpmMenuServices"
              to="services"
              className={linkClassName}
            >
              <span>{i18n("Services")}</span>
            </ToggleNavLink>
          </li>
          <li className="kpm-profile-item kpm-desktop">
            <ToggleNavLink
              id="kpmMenuProfile"
              to="profile"
              className={linkClassName}
            >
              <img
                src={createFilesUri(`/thumbnail/${currentUser?.username}`)}
                alt={i18n("Profile")}
                className="kpm-profile-image"
              />
            </ToggleNavLink>
          </li>
          <div className="kpm-menu-shotcuts">
            <li className="kpm-try">
              <a href="https://app.kth.se/kpm/" title={i18n("BetaTooltip")}>
                <span>‽</span>
              </a>
            </li>
            <li>
              <IconMail href={KTH_MAIL_URI} />
            </li>
            <li>
              <IconNewsfeed href={KTH_SOCIAL_SUBSCRIPTIONS_URI} />
            </li>
            <li>
              <IconNotifications
                href={KTH_SOCIAL_NOTIFICATIONS_URI}
                nNew={numNewNotifications}
              />
            </li>
          </div>
          <li className="kpm-profile-item kpm-mobile">
            <ToggleNavLink to="profile" className={linkClassName}>
              <img
                src={createFilesUri(`/thumbnail/${currentUser?.username}`)}
                alt=""
                className="kpm-profile-image"
              />
              {i18n("Profile")}
            </ToggleNavLink>
          </li>
          <li className="kpm-mobile-logout kpm-mobile">
            <a href={createApiUri("/auth/logout")}>{i18n("Logout")}</a>
          </li>
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
