import * as React from "react";
import { useLoaderData } from "react-router-dom";
import { ErrorMessage, LoadingPlaceholder } from "../components/common";
import { MenuPane } from "../components/menu";
import { createApiUri, useDataFecther } from "./utils";
import { i18n } from "../i18n/i18n";

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
      {msg && (
        <h2>
          {i18n("Profile")} {msg}
        </h2>
      )}
      {msg && (
        <p>
          <a href={createApiUri("/auth/logout")}>{i18n("Logout")}</a>
        </p>
      )}
    </MenuPane>
  );
}
