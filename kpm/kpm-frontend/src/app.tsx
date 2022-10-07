import * as React from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import {
  createHashRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  NavLink,
  Outlet,
  useLoaderData,
  useOutlet,
} from "react-router-dom";

function Spacer() {
  return <div className="spacer" />
}

function _linkClassName({ isActive } : any) {
  return isActive ? "active" : "";
}

function Menu() {
  return (<React.Fragment>
    <nav className="kpm-menu">
      <ol>
        <li><NavLink to="profile" className={_linkClassName}>Profile</NavLink></li>
        <li><NavLink to="schedule" className={_linkClassName}>Schedule</NavLink></li>
        <li><NavLink to="studies" className={_linkClassName}>Studies</NavLink></li>
        <li><NavLink to="teaching" className={_linkClassName}>Teaching</NavLink></li>
        <li><NavLink to="programme" className={_linkClassName}>Programme</NavLink></li>
        <li><NavLink to="groups" className={_linkClassName}>Groups</NavLink></li>
        <li><NavLink to="services" className={_linkClassName}>Services</NavLink></li>
        <Spacer />
        <li>M</li>
        <li>D</li>
        <li>N</li>
      </ol>
    </nav>
    <Outlet />
  </React.Fragment>);
}

function MenuPane({ children } : any) {
  // <CSSTransition classNames="AnimateMenuModal" timeout={500} unmountOnExit>
  // </CSSTransition>
  return (
      <dialog className="modal">
        <div className="modal-content">{children}</div>
      </dialog>
  )
}

function Profile() {
  const { msg } = useLoaderData() as { msg: string};
  return (
    <MenuPane>
      <h2>Profile {msg}</h2>
    </MenuPane>
  )
}

function Studies() {
  const { msg } = useLoaderData() as { msg: string};
  return (
    <MenuPane>
      <h2>Studies {msg}</h2>
    </MenuPane>
  )
}

function Teaching() {
  const { msg } = useLoaderData() as { msg: string};
  return (
    <MenuPane>
      <h2>Teaching {msg}</h2>
    </MenuPane>
  )
}

function Todo({ title }: any) {
  return (
    <MenuPane>
      <h2>{title}</h2>
      <p>TODO: Implement</p>
    </MenuPane>
  )
}

type TCreateRouterProps = {
  hasStudies: boolean,
  hasTeaching: boolean,
}

function createRouter({ hasStudies, hasTeaching }: TCreateRouterProps) {
  return createHashRouter(
    createRoutesFromElements(
  
      <Route path="/" element={<Menu />}>
          <Route
            path="/profile"
            element={<Profile />}
            loader={async ({ request }) => {
              const res = await fetch("/kpm/api", {
                signal: request.signal,
              });
              const json = await res.json();
              return json;
            }} />
          <Route
            path="/schedule"
            element={<Todo title="Schedule" />} />
          {hasStudies && <Route
            path="/studies"
            element={<Studies />}
            loader={async ({ request }) => {
              const res = await fetch("/kpm/api", {
                signal: request.signal,
              });
              const json = await res.json();
              return json;
            }} />}
          {hasTeaching && <Route
            path="/teaching"
            element={<Teaching />}
            loader={async ({ request }) => {
              const res = await fetch("/kpm/api", {
                signal: request.signal,
              });
              const json = await res.json();
              return json;
            }} />}
          <Route
            path="/programme"
            element={<Todo title="Programme" />} />
          <Route
            path="/groups"
            element={<Todo title="Groups" />} />
          <Route
            path="/services"
            element={<Todo title="Services" />} />
      </Route>
    )
  );
}


export function App() {
  return (
    <TransitionGroup>
      <RouterProvider router={createRouter({ hasStudies: true, hasTeaching: true })} />
    </TransitionGroup>
  )
}
