import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { i18n } from "../i18n/i18n";

import "./groups.scss";
import {
  isOnMobileBp,
  useDropdownToggleListener,
  usePositionDropdown,
} from "./groupsUtils";

export function CollapsableGroup({
  title,
  children,
  defaultOpen = false,
}: any) {
  return (
    <details className="kpm-collapsable-group" open={defaultOpen}>
      <summary>{title}</summary>
      <ul className="kpm-link-list">{children}</ul>
    </details>
  );
}

type TStyle = Record<string, string | undefined> | undefined;

type TDropdownMenuGroupProps = {
  title: string;
  className?: string;
  children: any;
  revealUp?: boolean;
  alignRight?: boolean;
  defaultOpen?: boolean;
};

export function DropdownMenuGroup({
  title,
  className,
  children,
  revealUp = false,
  alignRight = false,
  defaultOpen = false,
}: TDropdownMenuGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  const isOpenRef = useRef(open);
  const navigate = useNavigate();

  const [visiblyOpen, setVisiblyOpen] = useState(defaultOpen);
  const [dropdownStyle, setDropdownStyle]: [TStyle, Function] =
    useState(undefined);

  const menuWrapperRef = useRef(null);
  const dropDownRef = useRef(null);
  usePositionDropdown(
    menuWrapperRef,
    dropDownRef,
    isOpenRef,
    revealUp,
    alignRight,
    (newStyle: TStyle) => {
      if (newStyle === undefined || !isEqual(dropdownStyle, newStyle))
        setDropdownStyle(newStyle);
    }
  );

  const eventListenersSetRef = useRef(null);
  isOpenRef.current = open;
  useDropdownToggleListener(
    menuWrapperRef,
    dropDownRef,
    eventListenersSetRef,
    isOpenRef,
    setOpen
  );

  // This allows dropdown page to be animated on mobile with CSS
  // by manipulating visiblyOpen state
  useEffect(() => {
    if (!open) {
      // Wait until animation has completed on mobile
      // NOTE! Hardcoded duration
      if (isOnMobileBp()) {
        setTimeout(() => {
          setVisiblyOpen(false);
        }, 300);
      } else {
        setVisiblyOpen(false);
      }
    }

    if (open) {
      // Wait a tick to trigger animation
      requestAnimationFrame(() => {
        setVisiblyOpen(true);
      });
    }
  }, [open]);

  let innerCls = "kpm-link-list";
  if (open && visiblyOpen) {
    innerCls += " open";
  }
  const _inner = (
    <div ref={menuWrapperRef} style={dropdownStyle} className={innerCls}>
      <DropdownMobileHeader onBack={() => navigate(-1)} />
      <menu>{children}</menu>
    </div>
  );

  let cls = "kpm-dropdownmenu-group";
  if (className !== undefined) {
    cls += ` ${className}`;
  }
  if (open) {
    cls += " open";
  }

  return (
    <div ref={dropDownRef} className={cls}>
      <label>
        <button>{title}</button>
      </label>
      {_inner}
    </div>
  );
}

function isEqual(a: TStyle, b: TStyle): boolean {
  if (a === undefined || b === undefined) return a === b;
  const keys = { ...a, ...b };

  for (const key of Object.keys(keys)) {
    if (a[key] !== b[key]) {
      return false;
    }
  }

  return true;
}

export function GroupItem({ className, children }: any) {
  let cls = "item";
  if (className !== undefined) {
    cls += ` ${className}`;
  }
  return <li className={cls}>{children}</li>;
}

type TDropdownMobileHeaderProps = {
  onBack: () => void;
};

function DropdownMobileHeader({ onBack }: TDropdownMobileHeaderProps) {
  return (
    <button
      className="kpm-modal-back-button kpm-mobile"
      onClick={(e) => {
        e.preventDefault();
        onBack();
      }}
    >
      {i18n("Tillbaka")}
    </button>
  );
}
