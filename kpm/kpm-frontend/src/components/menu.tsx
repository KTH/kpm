import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { CSSTransition } from "react-transition-group";
import { i18n } from "../i18n/i18n";

import "./menu.scss";
import { useFocusTrap, useOverflowClipOnDemand } from "./menuUtils";

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

export function MenuPane({
  nodeRef = useRef<HTMLElement>(null),
  className,
  children,
}: any) {
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();
  // Simple animation on enter
  useEffect(() => {
    setIsActive(true);
  }, []);

  const doClose = (e?: React.MouseEvent) => {
    e?.preventDefault();
    // The menu element is recreated during navigation, so we need to find it
    // by id when we want to restore the focus
    const _activeMenuEl: HTMLElement | null = document.querySelector(
      ".kpm-menu > ul > li > .active"
    );
    const activeMenuElId = _activeMenuEl?.id;
    setIsActive(false);
    // NOTE: This should really listen to transitionEnd
    // but this is okay and doubles as fallback
    setTimeout(() => {
      navigate(-1);
      // Set focus on the previously active menu item, need timeout to allow
      // navigation updates to complete
      setTimeout(() => {
        const activeMenuEl: HTMLElement | null = document.querySelector(
          "#" + activeMenuElId
        );
        if (activeMenuEl) activeMenuEl.focus();
      }, 100);
    }, 310);
  };

  useOverflowClipOnDemand(nodeRef);
  useFocusTrap(nodeRef, doClose);

  let cls = "kpm-modal";
  if (isActive) cls += " active";

  let clsContent = "kpm-modal-content";
  if (className) clsContent += " " + className;

  return (
    <dialog ref={nodeRef} className={cls} aria-modal="true">
      <button className="kpm-modal-back-button kpm-mobile" onClick={doClose}>
        {i18n("Tillbaka till personliga menyn")}
      </button>
      <div className={clsContent}>{children}</div>
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
