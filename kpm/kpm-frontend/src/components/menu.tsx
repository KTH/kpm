import * as React from "react";
import { useEffect } from "react";
import { CSSTransition } from "react-transition-group";

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

export function MenuPane({ children }: any) {
  return (
    <MenuPaneWrapper>
      <div className="kpm-modal-content">{children}</div>
    </MenuPaneWrapper>
  );
}

export function MenuPaneWrapper({ nodeRef, className, children }: any) {
  let cls = "kpm-modal";
  if (className) cls += " " + className;

  return (
    <dialog ref={nodeRef} className={cls}>
      {children}
    </dialog>
  );
}

type TMenuPaneHeaderProps = {
  title: string,
  children?: JSX.Element,
}

export function MenuPaneHeader({ title, children = undefined}: TMenuPaneHeaderProps): JSX.Element {
  return (
    <header className="kpm-modal-content-header">
      <h2>{title}</h2>
      {children && <div className="kpm-modal-content-header-actions">{children}</div>}
    </header>
  )
}