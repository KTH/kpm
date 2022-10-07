import * as React from 'react';
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import {
  NavLink,
  useLocation,
  useOutlet,
} from "react-router-dom";
import { linkClassName } from './components/utils';
import { MenuPaneWrapper, MenuSpacer } from "./components/menu";
import { getRoutes } from './routes';

/*
  Why does this look a lot more complicated than basic react-router examples?
  To allow animations we need to implement this hack:
  https://reactcommunity.org/react-transition-group/with-react-router

  Not 100% the behaviour you want, but good enough for now.

  TODO: We get an initial delay on first open because we don't have any
  pane open. CSSTransition waits for 2xtimeout until the next page is viewed

  NOTE: This also requires each menu pane to maintain state otherwise it
  is lost during transitions because the useLoaderData hook only returns
  the most current response.
*/

export function Menu({ hasStudies, hasTeaching }: any) {
    const location = useLocation()
    const currentOutlet = useOutlet()
    const { nodeRef }: any =
      getRoutes().find((route) => route.path === location.pathname) ?? {}
  
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
      </nav>
      <SwitchTransition>
        <CSSTransition
          key={location.pathname}
          nodeRef={nodeRef}
          timeout={300}
          classNames="AnimateMenuModal"
          unmountOnExit>
          {(state) => (
            <MenuPaneWrapper nodeRef={nodeRef}>
              {currentOutlet}
            </MenuPaneWrapper>
          )}
        </CSSTransition>
      </SwitchTransition>
    </React.Fragment>);
  }
  