import React, { useEffect, useState } from "react";
import { MenuPane, MenuPaneHeader } from "../components/menu";
import { APIProgrammes } from "kpm-backend-interface";
import { fetchApi, useDataFecther } from "./utils";
import {
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
    // TODO: Handle more kinds of errors or keep it simple?
    throw new Error(json.message);
  }
}

export function useMutateProgrammes(res: APIProgrammes | undefined): {
  programmes: APIProgrammes["programmes"] | undefined;
  setStar(slug: string, value: boolean): void;
  errorSetStar: Error | undefined;
} {
  const [programmes, setProgrammes] = useState<APIProgrammes["programmes"]>();
  const [errorSetStar, setErrorSetStar] = useState<Error>();

  // Update state on res change (loaded/updated)
  useEffect(() => {
    if (res) {
      const { programmes } = res;
      setProgrammes(programmes);
      setErrorSetStar(undefined);
    }
  }, [res]);

  // ******************************************************
  // Allow widget to mutate the star property
  const setStar = async (slug: string, value: boolean) => {
    // Store to reset if call to API fails
    const oldProgrammes = programmes && [...programmes];
    // Clear error due to new interaction
    setErrorSetStar(undefined);

    let didChange = false;
    const newProgrammes = programmes?.map((programme) => {
      if (programme.slug === slug) {
        const { starred, ...other } = programme;
        if (programme.starred !== value) {
          didChange = true;
        }
        return {
          starred: value,
          ...other,
        };
      }
      return programme;
    });
    // Store change locally for quick feedback in UI
    setProgrammes(newProgrammes);

    if (didChange) {
      const res = await fetchApi("/api/star", {
        method: "post",
        body: JSON.stringify({
          kind: "program",
          slug,
          starred: value,
        }),
      }).catch((err: any) => {
        // Expose error and reset groups
        setErrorSetStar(err);
        setProgrammes(oldProgrammes);
      });
    }
  };

  return {
    programmes,
    setStar,
    errorSetStar,
  };
}

type TFilter = "favs" | "all";

export function Programme() {
  const { res, loading, error } =
    useDataFecther<APIProgrammes>(loaderProgrammes);
  const { programmes, setStar, errorSetStar } = useMutateProgrammes(res);

  const [filter, setFilter] = useState<TFilter>();

  // Switch to all if there are no starred programmes
  useEffect(() => {
    if (filter === undefined && Array.isArray(programmes)) {
      const hasStarred = !!programmes?.find((p) => p.starred);
      setFilter(hasStarred ? "favs" : "all");
    }
  }, [programmes]);

  const filteredProgrammes = programmes?.filter((programme) => {
    switch (filter) {
      case "favs":
        return programme.starred;
      case "all":
        return true;
    }
  });

  const isEmpty = !loading && !error && filteredProgrammes?.length === 0;

  return (
    <MenuPane className="kpm-programmes">
      <MenuPaneHeader title={i18n("My Programmes")}>
        <a
          title="Help / feedback for the personal menu in connection with the transition to new Ladok"
          href="https://www.kth.se/social/group/feedback-fran-anvand/page/personliga-menyn/"
        >
          Help / feedback
        </a>
        <IconSettings href="https://www.kth.se/social/home/settings/programmes" />
      </MenuPaneHeader>
      <TabFilter>
        <FilterOption<TFilter>
          value="favs"
          filter={filter || "all"}
          onSelect={setFilter}
        >
          {i18n("Favourites")}
        </FilterOption>
        <FilterOption<TFilter>
          value="all"
          filter={filter || "all"}
          onSelect={setFilter}
        >
          {i18n("All Subscriptions")}
        </FilterOption>
      </TabFilter>
      {loading && <LoadingPlaceholder />}
      {error && <ErrorMessage error={error} />}
      {errorSetStar && <ErrorMessage error={errorSetStar} compact />}
      {isEmpty && (
        <EmptyPlaceholder>
          {filter === "favs"
            ? i18n("You have no programmes marked as favourites.")
            : i18n("You don't belong to any programme.")}
        </EmptyPlaceholder>
      )}
      {!isEmpty && (
        <ul>
          {filteredProgrammes?.map((programme) => (
            <StarableItem
              key={`kpm-program-${programme.slug}`}
              starred={programme.starred}
              onToggle={() => setStar(programme.slug, !programme.starred)}
            >
              <a href={programme.url}>{i18n(programme.name)}</a>
            </StarableItem>
          ))}
        </ul>
      )}
    </MenuPane>
  );
}
