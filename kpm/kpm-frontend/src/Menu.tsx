import * as React from "react";
import { Outlet, useLocation, useNavigate, useNavigation } from "react-router-dom";
import { linkClassName } from "./components/utils";
import { MenuPaneBackdrop } from "./components/menu";
import { getRoutes } from './routes';
import { LoadingIndicator } from "./components/loading";
import { ToggleNavLink } from "./components/links";

const KTH_MAIL_URI = "https://webmail.kth.se/";
const KTH_SOCIAL_SUBSCRIPTIONS_URI = "https://www.kth.se/social/home/subscriptions/";
const KTH_SOCIAL_NOTIFICATIONS_URI = "https://www.kth.se/social/home/personal-menu/notifications/";


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
        <ul>
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
          <div className="kpm-menu-shotcuts">
            <li><IconMail href={KTH_MAIL_URI} /></li>
            <li><IconNewsfeed href={KTH_SOCIAL_SUBSCRIPTIONS_URI} /></li>
            <li><IconNotifications href={KTH_SOCIAL_NOTIFICATIONS_URI} /></li>
          </div>
        </ul>
        <LoadingIndicator isLoading={navigation.state === "loading"} />
      </nav>
      <Outlet />
    </React.Fragment>
  );
}

function IconMail({ href, target }: any) {
  return (
    <a href={href} target={target}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -100 1000 900" width="1em" height="1em" version="1.1">
        <title>KTH Webmail</title>
        <path fill="currentColor" d="M 30,54 Q -2,36 2,14 4,0 28,0 h 846 q 38,0 20,32 -8,14 -24,22 -14,6 -192,102 -178,96 -182,98 -16,10 -46,10 -28,0 -46,-10 -4,-2 -182,-98 Q 44,60 30,54 Z m 850,100 q 20,-10 20,10 v 368 q 0,16 -17,32 -17,16 -33,16 H 50 Q 34,580 17,564 0,548 0,532 V 164 q 0,-20 20,-10 l 384,200 q 18,10 46,10 28,0 46,-10 z"></path>
      </svg>
    </a>
  )
}
function IconNewsfeed({ href, target = null }: any) {
  return (
    <a href={href} target={target}>
      <svg xmlns="http://www.w3.org/2000/svg" version="1" viewBox="0 -100 1000 900" width="1em" height="1em">
        <title>News feed</title>
        <desc>News from your courses, groups and programmes</desc>
        <path fill="currentColor" d="M290 460h350l6-2h4v92q0 40-29 70t-71 30H300L150 800V650h-50q-40 0-70-30T0 550V250q0-42 30-71t70-29h190zm610-560q42 0 71 29t29 71v300q0 40-29 70t-71 30h-50v150L700 400H350V0q0-42 30-71t70-29z"></path>
      </svg>
    </a>
  )
}
function IconNotifications({ href, target }: any) {
  return (
    <a className="icon" href={href} target={target}>
      <svg xmlns="http://www.w3.org/2000/svg" version="1" viewBox="0 -100 1000 900" width="1em" height="1em">
        <title>Direct notifications</title>
        <path fill="currentColor" d="M792 202q58 138 67 258t-39 140q-28 12-61-3t-65-40q-32-25-99-41t-149-8q-28 4-42 19t-6 37q22 56 46 108 4 10 24 22t24 20q14 34-22 46-50 22-102 40-30 10-54-42-32-76-58-132-6-12-34-17t-46-31l-38 14q-34 12-74-12t-54-60q-17-32-5-79t43-61q126-52 213-108t124-103q37-47 59-92t25-78q3-33 15-59t36-36q48-20 130 70t142 228zm-28 300q8-4 10-38t-11-98q-13-64-41-128-28-66-67-123t-67-84Q560 4 552 8t-10 42q-2 38 10 105t40 133q28 66 68 119t68 76q28 23 36 19z"></path>
      </svg>
    </a>
  )
}