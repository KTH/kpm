import * as React from 'react';
import {
  useLoaderData,
} from "react-router-dom";
import { MenuPane } from "../components/menu";

export async function loaderTeaching({ request }: any) {
  const res = await fetch("/kpm/api", {
    signal: request.signal,
  });
  const json = await res.json();
  return json;
}

export function Teaching() {
  const { msg } = useLoaderData() as { msg: string };
  return (
    <MenuPane>
      <h2>Teaching {msg}</h2>
    </MenuPane>
  )
}