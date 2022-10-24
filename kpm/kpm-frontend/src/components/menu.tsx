import * as React from "react";
import { CSSTransition } from "react-transition-group";

export function MenuPaneBackdrop({ visible, onClose }: any) {
  const nodeRef = React.useRef(null);
  return (
    <CSSTransition
      nodeRef={nodeRef}
      in={visible}
      timeout={500}
      unmountOnExit
      classNames="ModalBackdropAnim">
      <div ref={nodeRef} className="modal-backdrop" onClick={((e) => {
        if (onClose) {
          e.preventDefault();
          onClose();
        }
      })}/>
    </CSSTransition>
  )
}

export function MenuPane({ children }: any) {
  return (
    <MenuPaneWrapper>
      <div className="modal-content">{children}</div>
    </MenuPaneWrapper>
  );
}

export function MenuPaneWrapper({ nodeRef, className, children }: any) {
  let cls = "modal";
  if (className) cls += " " + className;

  return (
    <dialog ref={nodeRef} className={cls}>
      {children}
    </dialog>
  );
}

export function MenuSpacer() {
  return <div className="menu-spacer" />;
}
