import * as React from 'react';
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import {
  createHashRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  NavLink,
  Outlet,
  useLoaderData,
  useLocation,
  useOutlet,
  useRoutes,
} from "react-router-dom";


const routes = [
  {
    path: "/profile",
    element: <Profile />,
    loader: async ({ request }: any) => {
      const res = await fetch("/kpm/api", {
        signal: request.signal,
      });
      const json = await res.json();
      return json;
    },
    nodeRef: React.createRef(),
  },
  {
    path: "/schedule",
    element: <Todo title="Schedule" />,
    nodeRef: React.createRef(),
  },
  {
    path: "/studies",
    element: <Studies />,
    loader: async ({ request }: any) => {
      const res = await fetch("/kpm/api", {
        signal: request.signal,
      });
      const json = await res.json();
      return json;
    },
    nodeRef: React.createRef(),
  },
  {
    path: "/teaching",
    element: <Teaching />,
    loader: async ({ request }: any) => {
      const res = await fetch("/kpm/api", {
        signal: request.signal,
      });
      const json = await res.json();
      return json;
    },
    nodeRef: React.createRef(),
  },
  {
    path: "/programme",
    element: <Todo title="Programme" />,
    nodeRef: React.createRef(),
  },
  {
    path: "/groups",
    element: <Todo title="Groups" />,
    nodeRef: React.createRef(),
  },
  {
    path: "/services",
    element: <Todo title="Services" />,
    nodeRef: React.createRef(),
  },
]

function Spacer() {
  return <div className="spacer" />
}

function _linkClassName({ isActive }: any) {
  return isActive ? "active" : "";
}

function Menu() {
  const location = useLocation()
  const currentOutlet = useOutlet()
  const { nodeRef } : any =
    routes.find((route) => route.path === location.pathname) ?? {}

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
    <SwitchTransition>
          <CSSTransition
            key={location.pathname}
            nodeRef={nodeRef}
            timeout={300}
            classNames="AnimateMenuModal"
            unmountOnExit>
            {(state) => (
              <div ref={nodeRef} className="menu-modal-wrapper">
                {currentOutlet}
              </div>
            )}
          </CSSTransition>
        </SwitchTransition>
  </React.Fragment>);
}

function MenuPane({ children }: any) {
  // <CSSTransition classNames="AnimateMenuModal" timeout={500} unmountOnExit>
  // </CSSTransition>
  return (
    <dialog className="modal">
      <div className="modal-content">{children}</div>
    </dialog>
  )
}

function Profile() {
  const { msg } = useLoaderData() as { msg: string } || {};
  return (
    <MenuPane>
      <h2>Profile {msg}</h2>
    </MenuPane>
  )
}

function Studies() {
  const { msg } = useLoaderData() as { msg: string } || {};
  return (
    <MenuPane>
      <h2>Studies {msg}</h2>
    </MenuPane>
  )
}

function Teaching() {
  const { msg } = useLoaderData() as { msg: string } || {};
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
  return createHashRouter([
    {
      path: '/',
      element: <Menu />,
      children: routes.map((route) => ({
        index: route.path === '/',
        path: route.path === '/' ? undefined : route.path,
        element: route.element,
        loader: route.loader
      })),
    },
  ]);
}


export function App() {
  return <RouterProvider router={createRouter({ hasStudies: true, hasTeaching: true })} />
}
