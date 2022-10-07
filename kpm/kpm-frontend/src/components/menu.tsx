import * as React from 'react';

export function MenuPane({ children }: any) {
  return (
    <MenuPaneWrapper>
      <div className="modal-content">{children}</div>
    </MenuPaneWrapper>
  )
}

export function MenuPaneWrapper({ nodeRef, className, children }: any) {
  let cls = "modal";
  if (className) cls += " " + className;
  
  return (
    <dialog ref={nodeRef} className={cls}>
      {children}
    </dialog>
  )
}

export function MenuSpacer() {
  return <div className="menu-spacer" />
}
