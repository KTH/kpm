import React, { useState } from "react";
import { MenuPane, MenuPaneHeader } from "../components/menu";
import { APIProgrammes } from "kpm-backend-interface";
import { createApiUri, formatTerm, useDataFecther } from "./utils";
import { EmptyPlaceholder, ErrorMessage, LoadingPlaceholder } from "../components/common";
import { i18n } from "../i18n/i18n";
import "./programme.scss";
import { IconSettings, IconStar } from "../components/icons";
import { FilterOption, TabFilter } from "../components/filter";

export async function loaderProgrammes({ request }: any = {}): Promise<APIProgrammes> {
  const res = await fetch(createApiUri("/api/programmes"), {
    signal: request?.signal,
  });
  const json = await res.json();
  return json;
}

type TFilter = "favs" | "all";

export function Programme() {
  const { res, loading, error } = useDataFecther<APIProgrammes>(loaderProgrammes);
  const { programmes } = res || {};

  const [filter, setFilter] = useState<TFilter>("favs");

  const filteredProgrammes = programmes?.filter((programme) => {
    switch (filter) {
      case "favs":
        return programme.stared;
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
          href="https://www.kth.se/social/group/feedback-fran-anvand/page/personliga-menyn/">Help / feedback</a>
        <IconSettings href="https://www.kth.se/social/home/settings/programmes" />
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
      {isEmpty && <EmptyPlaceholder>
        {filter === "favs"
          ? i18n("You have no programmes marked as favourites.")
          : i18n("You don't belong to any programme.")}
      </EmptyPlaceholder>}
      {!isEmpty && (
        <ul>
          {filteredProgrammes?.map((programme) => (
            <li>
              <IconStar className={programme.stared ? "star active" : "star"} />
              <a href={programme.url}>{i18n(programme.name)}</a>
            </li>
          ))}
        </ul>
      )}
    </MenuPane>
  );
}
