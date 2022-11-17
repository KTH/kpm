import React, { useState } from "react";
import { MenuPane, MenuPaneHeader } from "../components/menu";
import { APIGroups } from "kpm-backend-interface";
import { createApiUri, formatTerm, useDataFecther } from "./utils";
import { ErrorMessage, LoadingPlaceholder } from "../components/common";
import { i18n } from "../i18n/i18n";
import "./groups.scss";
import { IconSettings, IconStar } from "../components/icons";
import { FilterOption, TabFilter } from "../components/filter";

export async function loaderStudies({ request }: any = {}): Promise<APIGroups> {
  const res = await fetch(createApiUri("/api/groups"), {
    signal: request?.signal,
  });
  const json = await res.json();
  return json;
}

type TFilter = "favs" | "all";

export function Groups() {
  const { res, loading, error } = useDataFecther<APIGroups>(loaderStudies);
  const { groups, group_search_url } = res || {};

  const [filter, setFilter] = useState<TFilter>("favs");

  const filteredGroups = groups?.filter((group) => {
    switch (filter) {
      case "favs":
        return group.stared;
      case "all":
        return true;
    }
  });

  return (
    <MenuPane>
      <MenuPaneHeader title={i18n("My Groups")}>
        <a
          title="Search for interesting groups to follow"
          href="https://www.kth.se/search/?entityFilter=social-group&filterLabel=Groups"
        >
          {i18n("Find groups")}
        </a>
        <a href="https://www.kth.se/social/group-create/">
          {i18n("Create new group")}
        </a>
        <IconSettings href="https://www.kth.se/social/home/settings/groups" />
      </MenuPaneHeader>
      <TabFilter>
        <FilterOption<TFilter>
          value="favs"
          filter={filter}
          onSelect={setFilter}
        >
          {i18n("Favourites")}
        </FilterOption>
        <FilterOption<TFilter> value="all" filter={filter} onSelect={setFilter}>
          {i18n("All Subscriptions")}
        </FilterOption>
      </TabFilter>
      {loading && <LoadingPlaceholder />}
      {error && <ErrorMessage error={error} />}
      {filteredGroups && (
        <ul className="kpm-groups">
          {filteredGroups.map((group) => (
            <li>
              <IconStar className={group.stared ? "star active" : "star"} />
              <a href={group.url}>{group.name}</a>
            </li>
          ))}
        </ul>
      )}
    </MenuPane>
  );
}
