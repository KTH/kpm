import * as React from 'react';
import { MenuPane } from "./menu";

export function Todo({ title }: any) {
  return (
    <MenuPane>
      <h2>{title}</h2>
      <p>TODO: Implement</p>
    </MenuPane>
  )
}