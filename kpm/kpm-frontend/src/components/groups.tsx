import * as React from "react";

export function CollapsableGroup({ title, children, defaultOpen = false }: any) {
  const [open, setOpen] = React.useState(defaultOpen);

  let cls = "kpm-collapsable-group";
  if (open) {
    cls += " open"
  }

  let clsAnim = "kpm-anim";
  if (open) {
    clsAnim += " open";
  }

  return (
    <div className={cls}>
      <h2 onClick={(e) => { e.preventDefault(); setOpen(!open) }}><Caret open={open} />{title}</h2>
      <ul className="kpm-link-list">
        <div className={clsAnim}>
          {children}
        </div>
      </ul>
    </div>
  )
}

export function GroupItem({ className, children }: any) {
  return (
    <li className={className}>
      {children}
    </li>
  )
}

function Caret({ open = false }: any) {
  let cls = "kpm-caret";
  if (open) {
    cls += " open";
  }

  return (
    <svg className={cls} id="a" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 7.41 12"><path d="M0,10.58L4.58,6,0,1.41,1.41,0,7.41,6,1.41,12l-1.41-1.42Z" /></svg>
  )
}