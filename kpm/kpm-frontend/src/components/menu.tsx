import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { NavigateFunction } from "react-router";
import { CSSTransition } from "react-transition-group";
import { i18n } from "../i18n/i18n";
import { useAuthState } from "../state/authState";
import { LoginWidget } from "./login";

import "./menu.scss";

export function MenuPaneBackdrop({ visible, onClose }: any) {
  const nodeRef = React.useRef<HTMLElement>(null);
  return (
    <CSSTransition
      nodeRef={nodeRef}
      in={visible}
      timeout={500}
      unmountOnExit
      classNames="KpmModalBackdropAnim"
    >
      <Backdrop
        nodeRef={nodeRef}
        className="kpm-modal-backdrop"
        onClose={() => onClose && onClose()}
      />
    </CSSTransition>
  );
}

let _scrollBarWidth: number;
function getScrollBarWidth() {
  if (_scrollBarWidth !== undefined) return _scrollBarWidth;
  let el = document.createElement("div");
  el.style.cssText = "overflow:scroll; visibility:hidden; position:absolute;";
  document.body.appendChild(el);
  _scrollBarWidth = el.offsetWidth - el.clientWidth;
  el.remove();
  return _scrollBarWidth;
}

type TBackdropProps = {
  nodeRef: React.RefObject<HTMLElement>;
  className?: string | undefined;
  onClose?: Function;
};
function Backdrop({
  nodeRef,
  className,
  onClose,
}: TBackdropProps): JSX.Element {
  useEffect(() => {
    // Store parentNode so we can use it for cleanup
    let parentNode = nodeRef?.current?.parentNode;
    let oldOverflow: string = "";
    let oldPaddingRight: string = "";

    const scrollBarWidth = getScrollBarWidth();
    const body = document.body;
    const style = body.style;
    oldOverflow = style.overflow;
    style.overflow = "hidden";
    // If has scrollbar, set padding to avoid jumping
    if (body.scrollHeight > (window.visualViewport?.height || 0)) {
      oldPaddingRight = style.paddingRight;
      style.paddingRight = `${getScrollBarWidth()}px`;
      if (parentNode) {
        (
          parentNode as HTMLElement
        ).style.marginRight = `${getScrollBarWidth()}px`;
      }
    }

    return () => {
      const style = document.body.style;
      style.overflow = oldOverflow;
      style.paddingRight = oldPaddingRight;
      if (parentNode) {
        (parentNode as HTMLElement).style.marginRight = "";
      }
    };
  }, []);

  return (
    <div
      ref={nodeRef as any}
      className={className}
      tabIndex={-1}
      onClick={(e) => {
        if (onClose) {
          e.preventDefault();
          onClose();
        }
      }}
    />
  );
}

type TMenuPaneProps = {
  className?: string | undefined | null;
  error?: Error | undefined;
  children: any;
};

export function MenuPane({
  className = undefined,
  error = undefined,
  children,
}: TMenuPaneProps) {
  let cls = "kpm-modal-content";
  if (className) {
    cls += ` ${className}`;
  }

  let navigate: NavigateFunction;
  try {
    navigate = useNavigate();
  } catch (err: any) {
    // For smokescreen tests we don't want to be required to mount panes
    // in a router so then we want to accept that useNavigate isn't available.
  }
  const [currentUser] = useAuthState();

  return (
    <MenuPaneWrapper>
      <div className={cls}>
        {currentUser ? (
          children
        ) : (
          <div className="kpm-error-message">
            <h2>{i18n("Your session has expired")}</h2>
            <LoginWidget
              onDismiss={() => {
                navigate("/");
              }}
            />
          </div>
        )}
      </div>
    </MenuPaneWrapper>
  );
}

export function MenuPaneWrapper({ nodeRef, className, children }: any) {
  const [isActive, setIsActive] = useState(false);

  let cls = "kpm-modal";
  if (className) cls += " " + className;
  if (isActive) cls += " active";

  // Simple animation on enter
  if (!isActive) requestAnimationFrame(() => setIsActive(true));
  return (
    <dialog ref={nodeRef} className={cls}>
      {children}
    </dialog>
  );
}

type TMenuPaneHeaderProps = {
  title: string;
  children?: any;
};

export function MenuPaneHeader({
  title,
  children = undefined,
}: TMenuPaneHeaderProps): JSX.Element {
  return (
    <header className="kpm-modal-content-header">
      <h2>{title}</h2>
      {children && (
        <aside className="kpm-modal-content-header-actions">{children}</aside>
      )}
    </header>
  );
}
