import * as React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

export function ToggleNavLink({ children, to, onClick, ...props } : any) {
    const navigate = useNavigate();
    const location = useLocation();
    const isOpen = `/${to}` === location.pathname;
  
    return (
      <NavLink to={to} onClick={(e) => {
        if (!isOpen) return;
        e.preventDefault();
        navigate("/");
      }} {...props}>{children}</NavLink>
    )
  }
