import * as React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

export function ToggleNavLink({ children, to, onClick, ...props }: any) {
  const navigate = useNavigate();
  const location = useLocation();
  const thisIsOpen = `/${to}` === location.pathname;
  const isInRoot = "/" === location.pathname;

  return (
    <NavLink
      to={to}
      onClick={(e) => {
        e.preventDefault();
        if (thisIsOpen) {
          navigate("/", { replace: true });
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
