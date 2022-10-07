import * as React from 'react';
import {
  useLoaderData,
} from "react-router-dom";
import { MenuPane } from "../components/menu";

export async function loaderStudies({ request }: any) {
  const res = await fetch("/kpm/api", {
    signal: request.signal,
  });
  const json = await res.json();
  return json;
}

export function Studies() {
  // See Menu.tsx for note on why we maintain state here
  const { msg: msgIn } = useLoaderData() as { msg: string } || {};
  const [msg] = React.useState(msgIn);
  return (
    <MenuPane>
      <h2>Studies {msg}</h2>
    </MenuPane>
  )
}