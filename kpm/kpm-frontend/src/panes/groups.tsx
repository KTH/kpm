import React, { useEffect, useState } from "react";
import { MenuPane, MenuPaneHeader } from "../components/menu";
import { APIGroups } from "kpm-backend-interface";
import { fetchApi, postApi, useDataFecther } from "./utils";
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
import { NavigationTabs, Tab } from "@kth/style";

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

  return (
    <MenuPane className="kpm-groups" error={error}>
      <MenuPaneHeader title={i18n("My Groups")}>
        <a
          title={i18n("Search for interesting groups to follow")}
          href="https://www.kth.se/search/?entityFilter=social-group&filterLabel=Groups"
        >
          {i18n("Find groups")}
        </a>
        <a href="https://www.kth.se/social/group-create/">
          {i18n("Create new group")}
        </a>
        <IconSettings href="https://www.kth.se/social/home/settings/groups" />
      </MenuPaneHeader>

      {loading && <LoadingPlaceholder />}
      {error && <ErrorMessage error={error} />}
      {errorSetStar && <ErrorMessage error={errorSetStar} compact />}

      {!loading && !error && (
        <NavigationTabs id="filter" url="none" defaultValue="all">
          <Tab id="favs" title={i18n("Favourites")}>
            <Content groups={groups} filter="favs" onSetStar={setStar} />
          </Tab>
          <Tab id="all" title={i18n("All Subscriptions")}>
            <Content groups={groups} filter="all" onSetStar={setStar} />
          </Tab>
        </NavigationTabs>
      )}
    </MenuPane>
  );
}

function Content(props: { groups: any; filter: string; onSetStar: any }) {
  const { groups, filter, onSetStar } = props;

  const filteredGroups = groups?.filter((group: any) => {
    switch (filter) {
      case "favs":
        return group.starred;
      case "all":
        return true;
    }
  });

  const isEmpty = filteredGroups?.length === 0;

  if (isEmpty) {
    return (
      <EmptyPlaceholder>
        {filter === "favs"
          ? i18n("You have no groups marked as favourites.")
          : i18n("You don't belong to any groups.")}
      </EmptyPlaceholder>
    );
  }

  return (
    <ul>
      {filteredGroups?.map((group: any) => (
        <StarableItem
          className="kpm-groups-item"
          key={`kpm-group-${group.slug}`}
          starred={group.starred}
          onToggle={() => onSetStar(group.slug, !group.starred)}
        >
          <a href={group.url}>{group.name}</a>
        </StarableItem>
      ))}
    </ul>
  );
}
