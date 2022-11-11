import * as React from "react";
import { useLoaderData } from "react-router-dom";
import { MenuPane } from "../components/menu";
import { createApiUri } from "./utils";

export async function loaderProfile({ request }: any) {
  const res = await fetch("/kpm/api", {
    signal: request.signal,
  });
  const json = await res.json();
  return json;
}

export function Profile() {
  const { msg } = useLoaderData() as { msg: string };
  return (
    <MenuPane>
      <h2>Profile {msg}</h2>
      <p>
        <a href={createApiUri("/auth/logout")}>Logout</a>
      </p>
    </MenuPane>
  );
}
