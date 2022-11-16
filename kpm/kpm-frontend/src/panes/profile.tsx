import * as React from "react";
import { useLoaderData } from "react-router-dom";
import { ErrorMessage, LoadingPlaceholder } from "../components/common";
import { MenuPane } from "../components/menu";
import { createApiUri, useDataFecther } from "./utils";

export async function loaderProfile({ request }: any = {}) {
  const res = await fetch("/kpm/api", {
    signal: request?.signal,
  });
  const json = await res.json();
  return json;
}

export function Profile() {
  const { res, loading, error } = useDataFecther<{ msg: string }>(
    loaderProfile
  );
  const { msg } = res || {};
  // const { msg } = useLoaderData() as { msg: string };
  return (
    <MenuPane>
      {loading && <LoadingPlaceholder />}
      {error && <ErrorMessage error={error} />}
      {msg && <h2>Profile {msg}</h2>}
      {msg && (
        <p>
          <a href={createApiUri("/auth/logout")}>Logout</a>
        </p>
      )}
    </MenuPane>
  );
}
