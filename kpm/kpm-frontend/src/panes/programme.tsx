import React, { useEffect, useState } from "react";
import { MenuPane, MenuPaneHeader } from "../components/menu";
import { APIProgrammes, TCanvasRoom } from "kpm-backend-interface";
import { fetchApi, postApi, useDataFecther } from "./utils";
import {
  AuthError,
  EmptyPlaceholder,
  ErrorMessage,
  LoadingPlaceholder,
} from "../components/common";
import { i18n } from "../i18n/i18n";
import "./programme.scss";
import { IconSettings, StarableItem } from "../components/icons";
import { FilterOption, TabFilter } from "../components/filter";

export async function loaderProgrammes({
  request,
}: any = {}): Promise<APIProgrammes> {
  const res = await fetchApi("/api/programmes", {
    signal: request?.signal,
  });
  const json = await res.json();
  if (res.ok) {
    return json;
  } else {
    if (res.status === 401) {
      throw new AuthError(json.message);
    }
    throw new Error(json.message);
  }
}

export function useMutateProgrammes(res: APIProgrammes | undefined): {
  programmes: APIProgrammes["programRooms"] | undefined;
} {
  const [programmes, setProgrammes] = useState<APIProgrammes["programRooms"]>();

  // Update state on res change (loaded/updated)
  useEffect(() => {
    if (res) {
      const { programRooms } = res;
      setProgrammes(programRooms);
    }
  }, [res]);

  // We have deprecated starring programs for now. Check earlier versions of this file for the code.

  return {
    programmes,
  };
}

type TFilter = "favs" | "all";

export function Programme() {
  const { res, loading, error } =
    useDataFecther<APIProgrammes>(loaderProgrammes);
  const { programmes } = useMutateProgrammes(res);

  const [filter, setFilter] = useState<TFilter>();

  // Switch to all if there are no starred programmes
  useEffect(() => {
    if (filter === undefined && Array.isArray(programmes)) {
      const hasStarred = !!programmes?.find((p) => p.starred);
      setFilter(hasStarred ? "favs" : "all");
    }
  }, [programmes]);

  const isEmpty =
    !loading && !error && (!programmes || Object.keys(programmes).length === 0);
  return (
    <MenuPane className="kpm-programmes" error={error}>
      <MenuPaneHeader title={i18n("My Programmes")}>
        <a
          title="Help / feedback for the personal menu in connection with the transition to new Ladok"
          href="https://www.kth.se/social/group/feedback-fran-anvand/page/personliga-menyn/"
        >
          Help / feedback
        </a>
        <IconSettings href="https://www.kth.se/social/home/settings/programmes" />
      </MenuPaneHeader>
      {loading && <LoadingPlaceholder />}
      {error && <ErrorMessage error={error} />}
      {isEmpty && (
        <EmptyPlaceholder>
          {i18n("You don't belong to any programme.")}
        </EmptyPlaceholder>
      )}
      {!isEmpty && (
        <ul>
          {programmes &&
            Object.entries(programmes).map(([code, programme]) => (
              <li className="kpm-programme-item" key={`kpm-program-${code}`}>
                <a
                  href={
                    typeof programme.url === "string"
                      ? programme.url
                      : programme.url?.href
                  }
                >
                  {programme.name}
                </a>
              </li>
            ))}
        </ul>
      )}
    </MenuPane>
  );
}
