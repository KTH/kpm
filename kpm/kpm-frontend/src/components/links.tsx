import * as React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { getRoutes } from "../routes";

export function ToggleNavLink({ children, to, onClick, ...props }: any) {
  const navigate = useNavigate();
  const location = useLocation();
  const thisIsOpen = `/${to}` === location.pathname;
  const isInRoot = !getRoutes().some(
    (r) => typeof r.path === "string" && location.pathname.startsWith(r.path)
  );

  return (
    <NavLink
      to={to}
      onClick={(e) => {
        e.preventDefault();
        if (thisIsOpen) {
          navigate(-1);
          return;
        }
        // Another pane is open so we replace nav history
        navigate(to, { replace: !isInRoot });
      }}
      {...props}
    >
      {children}
    </NavLink>
  );
}
