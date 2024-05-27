import React, { Fragment } from "react";
import { useEffect, useState } from "react";
import type {
  APITeaching,
  TCanvasRoom,
  TCourseCode,
  TTeachingCourse,
} from "kpm-backend-interface";
import { IconStar } from "../components/icons";
import { MenuPane } from "../components/menu";
import { DropdownMenuGroup, GroupItem } from "../components/groups";
import { FilterOption, TabFilter } from "../components/filter";
import { ExamRoomList } from "../components/courseComponents";
import {
  fetchApi,
  postApi,
  formatTerm,
  useDataFecther,
  prefixHost,
} from "./utils";
import {
  AuthError,
  EmptyPlaceholder,
  ErrorMessage,
  LoadingPlaceholder,
} from "../components/common";
import { i18n } from "../i18n/i18n";

import "./teaching.scss";

export async function loaderTeaching({
  request,
}: any = {}): Promise<APITeaching> {
  const res = await fetchApi("/api/teaching", {
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

type TFilter = "favs" | "not_cancelled" | "all";

export function Teaching() {
  const { res, loading, error } = useDataFecther<APITeaching>(loaderTeaching);
  const { courses, setStar, errorSetStar } = useMutateCourses(res);

  const isEmpty = !loading && !error && courses.length === 0;

  const [filter, setFilter] = useState<TFilter>();
  useEffect(() => {
    if (filter === undefined && courses.length > 0) {
      if (courses?.find(([_cc, c]) => c.starred)) {
        setFilter("favs");
      } else if (
        courses.find(
          ([_cc, c]) => c.state === "ESTABLISHED" || c.state === "DEACTIVATED"
        )
      ) {
        setFilter("not_cancelled");
      } else {
        setFilter("all");
      }
    }
  }, [courses]);

  const filtered = courses.filter(([_key, course]) => {
    switch (filter) {
      case "favs":
        return course.starred;
      case "not_cancelled":
        return course.state === "ESTABLISHED";
      default:
        return true;
    }
  });
  return (
    <MenuPane error={error}>
      <TabFilter>
        <FilterOption<TFilter>
          value="favs"
          filter={filter || "favs"}
          onSelect={setFilter}
        >
          {i18n("Favourites")}
        </FilterOption>
        <FilterOption<TFilter>
          value="not_cancelled"
          filter={filter || "favs"}
          onSelect={setFilter}
        >
          {i18n("not_cancelled")}
        </FilterOption>
        <FilterOption<TFilter>
          value="all"
          filter={filter || "favs"}
          onSelect={setFilter}
        >
          {i18n("all_courses")}
        </FilterOption>
      </TabFilter>
      {loading && <LoadingPlaceholder />}
      {error && <ErrorMessage error={error} />}
      {errorSetStar && <ErrorMessage error={errorSetStar} compact />}
      {isEmpty && (
        <EmptyPlaceholder>
          {i18n("You aren't teaching any courses.")}
        </EmptyPlaceholder>
      )}
      {filtered && (
        <div className="kpm-teaching">
          {filtered.map(([code, course]) => {
            return (
              <Course
                key={code}
                courseCode={code}
                course={course}
                setStar={setStar}
              />
            );
          })}
        </div>
      )}
    </MenuPane>
  );
}

export function useMutateCourses(res: APITeaching | undefined): {
  courses: [TCourseCode, TTeachingCourse][];
  setStar(slug: string, value: boolean): void;
  errorSetStar: Error | undefined;
} {
  const [courses, setCourses] = useState<APITeaching["courses"]>();
  const [errorSetStar, setErrorSetStar] = useState<Error>();

  // Update state on res change (loaded/updated)
  useEffect(() => {
    if (res) {
      const { courses } = res;
      setCourses(courses);
      setErrorSetStar(undefined);
    }
  }, [res]);

  // ******************************************************
  // Allow widget to mutate the star property
  const setStar = async (slug: string, value: boolean) => {
    // Store to reset if call to API fails
    const oldGroups = { ...courses };
    // Clear error due to new interaction
    setErrorSetStar(undefined);

    let didChange = false;
    const newGroups = { ...courses };
    if (slug in newGroups) {
      if (newGroups[slug].starred !== value) {
        newGroups[slug].starred = value;
        didChange = true;
      }
    }
    // Store change locally for quick feedback in UI
    setCourses(newGroups);

    if (didChange) {
      const res = await postApi("/api/star", {
        kind: "course",
        slug,
        starred: value,
      }).catch((err: any) => {
        // Expose error and reset groups
        setErrorSetStar(err);
        setCourses(oldGroups);
      });
    }
  };

  return {
    courses: Object.entries(courses || {}),
    setStar,
    errorSetStar,
  };
}

type TCourseProps = {
  courseCode: string;
  course: TTeachingCourse;
  setStar(slug: string, value: boolean): void;
};

function Course({ courseCode, course, setStar }: TCourseProps) {
  const courseName = i18n(course.title); // TODO: perhaps convert i18n to i18nHook that fetches language and returns i18n function
  const aboutCourseUrl = prefixHost("www", `/kurs-pm/${courseCode}/om-kurs-pm`);
  // TODO: These should be changed to course rooms, check backend
  const {
    shortList = [],
    exams = [],
    allCourseRooms = [],
  } = course.rooms ? filterCanvasRooms(course.rooms) : {};
  const currentTerm = getCurrentTerm();

  return (
    <section className="kpm-teaching-course">
      <h2 className="kpm-teaching-course-code">{courseCode}</h2>
      <IconStar
        starred={course.starred}
        onClick={() => setStar(courseCode, !course.starred)}
      />
      <p className="kpm-teaching-course-name">
        {courseName}{" "}
        {course.state === "ESTABLISHED" ? (
          ""
        ) : (
          <i className="kpm-muted-text">{i18n("cstate_" + course.state)}</i>
        )}
      </p>
      <a href={aboutCourseUrl}>{i18n("Om kursen (kurs-PM m.m.)")}</a>
      <CourseAdminDropdown courseCode={courseCode} currentTerm={currentTerm} />
      <div className="kpm-row">
        <h3>{i18n("Canvas:")}</h3>
        {course.rooms === null && (
          <p className="kpm-muted-text">
            {i18n("Canvas is silent, try later...")}
          </p>
        )}
        {course.rooms?.length === 0 && (
          <p className="kpm-muted-text">{i18n("No rooms found in Canvas")}</p>
        )}
        <CanvasRoomShortList rooms={shortList} />
        <CanvasRoomExpandedList
          rooms={allCourseRooms}
          title={i18n("Alla kursrum")}
        />
        <ExamRoomList rooms={exams} title={i18n("Alla examinationsrum")} />
      </div>
    </section>
  );
}
// <CanvasRoomExpandedList rooms={other} />

type TCanvasRoomShortListProps = {
  rooms: TCanvasRoom[];
};

function CanvasRoomShortList({ rooms }: TCanvasRoomShortListProps) {
  if (rooms.length === 0) return null;

  return (
    <ul className="kpm-teaching-course-rooms">
      {rooms.map((room: TCanvasRoom) => {
        const key = `${room.registrationCode}-${room.startTerm}`;
        return (
          <li key={key}>
            <CanvasRoomLink
              url={room.url}
              type={room.type}
              code={room.registrationCode}
              startTerm={room.startTerm!}
            />
          </li>
        );
      })}
    </ul>
  );
}

type TCanvasRoomExpandedListProps = {
  rooms: TCanvasRoom[];
  title: string;
};
function CanvasRoomExpandedList({
  rooms,
  title,
}: TCanvasRoomExpandedListProps) {
  // Only show this if it has any items
  if (rooms.length === 0) return null;

  // First group rooms by year/other
  const groups: { [index: string]: TCanvasRoom[] } = {};
  for (const room of rooms) {
    if (room.startTerm === undefined) {
      groups["other"] ??= [];
      groups["other"].push(room);
    } else {
      const year = room.startTerm!.slice(0, 4);
      groups[year] ??= [];
      groups[year].push(room);
    }
  }

  // Then sort each group by term
  const groupedRooms = [];
  for (const year in groups) {
    const rooms = groups[year];
    groupedRooms.push({
      year,
      rooms: rooms.sort((a, b) => {
        if (a.startTerm === b.startTerm) return 0;
        // Sort terms asc
        const aTrm = a.startTerm?.slice(4, 6);
        const bTrm = b.startTerm?.slice(4, 6);
        if (bTrm === undefined) return -1; // if b has undefined term, it should be sorted last
        return aTrm?.localeCompare(bTrm) ?? 1; // if a has undefined term, it should be sorted last
      }),
    });
  }

  // Sort groups by year desc with other last
  groupedRooms.sort((a, b) => {
    if (a.year === "other") return 1;
    if (b.year === "other") return -1;
    return b.year.localeCompare(a.year);
  });

  return (
    <DropdownMenuGroup className="kpm-course-rooms" title={title}>
      {groupedRooms.map(({ year, rooms }) => {
        return (
          <Fragment>
            <li className="kpm-row">
              <div className="kpm-col">
                <h3>{year}</h3>
              </div>
              <div className="kpm-row">
                {year !== "other" &&
                  groups[year]?.map((room: TCanvasRoom) => (
                    <CanvasRoomLink
                      key={`${room.registrationCode}-${room.startTerm}`}
                      url={room.url}
                      type={room.type}
                      code={room.registrationCode}
                      startTerm={room.startTerm!}
                    />
                  ))}
                {year === "other" &&
                  groups["other"].map((room: TCanvasRoom) => (
                    <CanvasRoomLink
                      key={
                        room.type !== "rapp"
                          ? `${room.registrationCode}-${room.startTerm}`
                          : room.url.toString().split("/course/")[1]
                      }
                      url={room.url}
                      type={room.type}
                      code={room.registrationCode}
                      startTerm={room.startTerm!}
                    />
                  ))}
              </div>
            </li>
          </Fragment>
        );
      })}
    </DropdownMenuGroup>
  );
}

{
  /* <GroupItem key={room.startTerm}>
<CanvasRoomLink
  url={room.url.toString()}
  type={room.type}
  code={room.registrationCode}
  startTerm={room.startTerm!}
/>
</GroupItem> */
}

type TCanvasRoomLinkProps = {
  url: URL | string;
  type: string | undefined;
  code?: string;
  startTerm?: string;
};

export function CanvasRoomLink({
  url,
  type,
  code,
  startTerm,
}: TCanvasRoomLinkProps) {
  // This is a Component to force consistency
  return (
    <a href={typeof url === "string" ? url : url.href}>
      {startTerm && formatTerm(startTerm)} {`(${code || type || "?"})`}
    </a>
  );
}

function getCurrentTerm() {
  const today = new Date();
  const term = today.getMonth() <= 6 /* July */ ? "VT" : "HT";
  const year = today.getFullYear();
  return term + year;
}

function filterCanvasRooms(rooms: TCanvasRoom[]): {
  shortList: TCanvasRoom[];
  allCourseRooms: TCanvasRoom[];
  exams: TCanvasRoom[];
} {
  const hasFavourite = rooms.some((p) => p.favorite);

  rooms.sort((a: TCanvasRoom, b: TCanvasRoom) => {
    const aVal = parseInt(a.startTerm || "0");
    const bVal = parseInt(b.startTerm || "0");
    if (aVal === bVal) return 0;
    if (aVal > bVal) return -1;
    return 1;
  });

  const exams = rooms.filter((c: TCanvasRoom) => c.type === "exam");
  const courseRooms = rooms.filter((c: TCanvasRoom) => c.type !== "exam");

  if (hasFavourite) {
    return {
      shortList: rooms.filter((c) => c.favorite),
      allCourseRooms: courseRooms,
      exams,
    };
  }

  if (courseRooms.length <= 4) {
    return {
      shortList: courseRooms,
      allCourseRooms: [],
      exams,
    };
  }

  if (courseRooms.length === 0) {
    return {
      shortList: [],
      allCourseRooms: [],
      exams,
    };
  }

  return {
    shortList: courseRooms.slice(0, 3),
    allCourseRooms: courseRooms,
    exams,
  };
}

type TCourseAdminDropdownProps = {
  courseCode: string;
  currentTerm: string;
};

function CourseAdminDropdown({
  courseCode,
  currentTerm,
}: TCourseAdminDropdownProps) {
  return (
    <DropdownMenuGroup
      title={i18n("Administrera kurs")}
      className="kpm-teaching-course-admin-dropdown"
    >
      <GroupItem>
        <a
          href={prefixHost(
            "www",
            `/social/course/${courseCode}/editassistants/`
          )}
        >
          {i18n("Administrera assistenter")}
        </a>
      </GroupItem>
      <GroupItem>
        <a href={prefixHost("www", `/social/course/${courseCode}/subgroup/`)}>
          {i18n("Hantera Omgångar/grupper")}
        </a>
      </GroupItem>
      <GroupItem>
        <a
          href={prefixHost(
            "app",
            `/studentlistor/kurstillfallen/?courseCode=${courseCode}&term=${currentTerm}`
          )}
        >
          {i18n("Kursdeltagare")}
        </a>
      </GroupItem>
      <GroupItem>
        <a href={prefixHost("app", `/kopps/admin/courses/${courseCode}/`)}>
          {i18n("Kursinformation i Kopps")}
        </a>
      </GroupItem>
      <GroupItem>
        <a
          href={prefixHost(
            "app",
            `/kursinfoadmin/kurser/kurs/edit/${courseCode}`
          )}
        >
          {i18n("Redigera introduktion till kursen")}
        </a>
      </GroupItem>
      <GroupItem>
        <a href={prefixHost("app", `kursinfoadmin/kurs-pm-data/${courseCode}`)}>
          {i18n("Skapa och publicera kurs-PM")}
        </a>
      </GroupItem>
      <GroupItem>
        <a href={prefixHost("www", `/social/course/${courseCode}/survey/`)}>
          {i18n("Kursvärdering")}
        </a>
      </GroupItem>
      <GroupItem>
        <a
          href={prefixHost(
            "app",
            `/kursinfoadmin/kursutveckling/${courseCode}`
          )}
        >
          {i18n("Publicera ny kursanalys")}
        </a>
      </GroupItem>
      <GroupItem>
        <a
          href={`https://www.start.ladok.se/Shibboleth.sso/Login?entityID=https%3A%2F%2Fsaml.sys.kth.se%2Fidp%2Fshibboleth&target=https%3A%2F%2Fwww.start.ladok.se%2Fgui%2Fshiblogin%23%2Fsok%2Fkurstillfalle%3Fkurskod%3D${courseCode}`}
        >
          {i18n("Se provresultat")}
        </a>
      </GroupItem>
      <GroupItem>
        <a href={prefixHost("www", `/social/course/${courseCode}/students/`)}>
          {i18n("Studentgruppen / Prenumeranter")}
        </a>
      </GroupItem>
      <GroupItem>
        <a
          href={prefixHost(
            "app",
            `/aktivitetstillfallen/schema?courseCode=${courseCode}`
          )}
        >
          {i18n("Sök tentamen")}
        </a>
      </GroupItem>
    </DropdownMenuGroup>
  );
}
