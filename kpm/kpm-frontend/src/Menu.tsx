import * as React from 'react';
import {
  NavLink,
  Outlet,
  useNavigation,
} from "react-router-dom";
import { linkClassName } from './components/utils';
import { MenuSpacer } from "./components/menu";

export function Menu({ hasStudies, hasTeaching }: any) {
  const navigation = useNavigation();

  return (<React.Fragment>
    <nav className="kpm-menu">
      <ol>
        <li><NavLink to="profile" className={linkClassName}>Profile</NavLink></li>
        <li><NavLink to="schedule" className={linkClassName}>Schedule</NavLink></li>
        {hasStudies && <li><NavLink to="studies" className={linkClassName}>Studies</NavLink></li>}
        {hasTeaching && <li><NavLink to="teaching" className={linkClassName}>Teaching</NavLink></li>}
        <li><NavLink to="programme" className={linkClassName}>Programme</NavLink></li>
        <li><NavLink to="groups" className={linkClassName}>Groups</NavLink></li>
        <li><NavLink to="services" className={linkClassName}>Services</NavLink></li>
        <MenuSpacer />
        <li>M</li>
        <li>D</li>
        <li>N</li>
      </ol>
      <LoadingIndicator isLoading={navigation.state === "loading"} />
    </nav>
    <Outlet />
  </React.Fragment>);
}

function LoadingIndicator({ isLoading }: any) {
  let cls = "kpm-loading-indicator";
  if (isLoading) {
    cls += " loading";
  }

  return (
    <div className={cls}></div>
  )
}