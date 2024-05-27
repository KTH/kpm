import React, { useEffect, useState } from "react";
import { MenuPane, MenuPaneHeader } from "../components/menu";
import { APIGroups } from "kpm-backend-interface";
import { fetchApi, postApi, useDataFecther, prefixHost } from "./utils";
import {
  AuthError,
  EmptyPlaceholder,
  ErrorMessage,
  LoadingPlaceholder,
} from "../components/common";
import { i18n } from "../i18n/i18n";
import "./groups.scss";
import { IconSettings, StarableItem } from "../components/icons";
import { FilterOption, TabFilter } from "../components/filter";

export async function loaderStudies({ request }: any = {}): Promise<APIGroups> {
  const res = await fetchApi("/api/groups", {
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

export function useMutateGroups(res: APIGroups | undefined): {
  groups: APIGroups["groups"] | undefined;
  setStar(slug: string, value: boolean): void;
  errorSetStar: Error | undefined;
} {
  const [groups, setGroups] = useState<APIGroups["groups"]>();
  const [errorSetStar, setErrorSetStar] = useState<Error>();

  // Update state on res change (loaded/updated)
  useEffect(() => {
    if (res) {
      const { groups } = res;
      setGroups(groups);
      setErrorSetStar(undefined);
    }
  }, [res]);

  // ******************************************************
  // Allow widget to mutate the star property
  const setStar = async (slug: string, value: boolean) => {
    // Store to reset if call to API fails
    const oldGroups = groups && [...groups];
    // Clear error due to new interaction
    setErrorSetStar(undefined);

    let didChange = false;
    const newGroups = groups?.map((group) => {
      if (group.slug === slug) {
        const { starred, ...other } = group;
        if (group.starred !== value) {
          didChange = true;
        }
        return {
          starred: value,
          ...other,
        };
      }
      return group;
    });
    // Store change locally for quick feedback in UI
    setGroups(newGroups);

    if (didChange) {
      const res = await postApi("/api/star", {
        kind: "group",
        slug,
        starred: value,
      }).catch((err: any) => {
        // Expose error and reset groups
        setErrorSetStar(err);
        setGroups(oldGroups);
      });
    }
  };

  return {
    groups,
    setStar,
    errorSetStar,
  };
}

type TFilter = "favs" | "all";

export function Groups() {
  const { res, loading, error } = useDataFecther<APIGroups>(loaderStudies);
  const { groups, setStar, errorSetStar } = useMutateGroups(res);

  const [filter, setFilter] = useState<TFilter>();

  // Switch to all if there are no starred groups
  useEffect(() => {
    if (filter === undefined && Array.isArray(groups)) {
      const hasStarred = !!groups?.find((g) => g.starred);
      setFilter(hasStarred ? "favs" : "all");
    }
  }, [groups]);

  const filteredGroups = groups?.filter((group) => {
    switch (filter) {
      case "favs":
        return group.starred;
      case "all":
        return true;
    }
  });

  const isEmpty = !loading && !error && filteredGroups?.length === 0;

  return (
    <MenuPane className="kpm-groups" error={error}>
      <MenuPaneHeader title={i18n("My Groups")}>
        <a
          title={i18n("Search for interesting groups to follow")}
          href={prefixHost(
            "www",
            "/search/?entityFilter=social-group&filterLabel=Groups"
          )}
        >
          {i18n("Find groups")}
        </a>
        <a href={prefixHost("www", "/social/group-create/")}>
          {i18n("Create new group")}
        </a>
        <IconSettings
          href={prefixHost("www", "/social/home/settings/groups")}
        />
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
            ? i18n("You have no groups marked as favourites.")
            : i18n("You don't belong to any groups.")}
        </EmptyPlaceholder>
      )}
      {!isEmpty && (
        <ul>
          {filteredGroups?.map((group) => (
            <StarableItem
              className="kpm-groups-item"
              key={`kpm-group-${group.slug}`}
              starred={group.starred}
              onToggle={() => setStar(group.slug, !group.starred)}
            >
              <a href={group.url}>{group.name}</a>
            </StarableItem>
          ))}
        </ul>
      )}
    </MenuPane>
  );
}
