import * as React from "react";

import "./groups.scss";

export function CollapsableGroup({ title, children, defaultOpen = false }: any) {
  return (
    <details className="kpm-collapsable-group">
      <summary>{title}</summary>
      <ul className="kpm-link-list">
        {children}
      </ul>
    </details>
  )
}

export function GroupItem({ className, children }: any) {
  return (
    <li className={className}>
      {children}
    </li>
  )
}