import React from "react";
import type { APITeaching, TCanvasRoom } from "kpm-backend-interface";
import { MenuPane } from "../components/menu";
import { DropdownMenuGroup, GroupItem } from "../components/groups";
import { fetchApi, formatTerm, useDataFecther } from "./utils";
import {
  AuthError,
  EmptyPlaceholder,
  ErrorMessage,
  LoadingPlaceholder,
} from "../components/common";
import { i18n } from "../i18n/i18n";

import "./teaching.scss";
import { ExamRoomList } from "../components/courseComponents";

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

export function Teaching() {
  const { res, loading, error } = useDataFecther<APITeaching>(loaderTeaching);
  const { courses } = res || {};
  // const { courses } = useLoaderData() as APITeaching;

  const isEmpty = !loading && !error && Object.keys(courses || {}).length === 0;

  return (
    <MenuPane>
      {loading && <LoadingPlaceholder />}
      {error && <ErrorMessage error={error} />}
      {isEmpty && (
        <EmptyPlaceholder>
          {i18n("You aren't teaching any courses.")}
        </EmptyPlaceholder>
      )}
      {courses && (
        <div className="kpm-teaching">
          {Object.entries(courses).map(([code, course]) => {
            return <Course key={[code]} courseCode={code} course={course} />;
          })}
        </div>
      )}
    </MenuPane>
  );
}

function Course({ courseCode, course }: any) {
  const courseName = i18n(course.title); // TODO: perhaps convert i18n to i18nHook that fetches language and returns i18n function
  const aboutCourseUrl = `https://www.kth.se/kurs-pm/${courseCode}/om-kurs-pm`;
  // TODO: These should be changed to course rooms, check backend
  const {
    current = [],
    exams = [],
    other = [],
  } = course.rooms ? filterCanvasRooms(course.rooms) : {};
  const currentTerm = "HT2022";

  return (
    <div className="kpm-teaching-course">
      <h2 className="kpm-teaching-course-code">{courseCode}</h2>
      <div className="kpm-row">
        <p className="kpm-teaching-course-name">{courseName}</p>
        <a href={aboutCourseUrl}>{i18n("Om kursen (kurs-PM m.m.)")}</a>
        <CourseAdminDropdown
          courseCode={courseCode}
          currentTerm={currentTerm}
        />
        <div className="kpm-row">
          <h3>{i18n("Canvas:")}</h3>
          {course.rooms === null && (
            <p className="kpm-muted-text">
              {i18n("Canvas is silent, try later...")}
            </p>
          )}
          <CanvasRoomShortList rooms={current} />
          <CanvasRoomExpandedList
            rooms={[...current, ...other]}
            title={i18n("Alla kursrum")}
          />
          <ExamRoomList rooms={exams} title={i18n("Alla examinationsrum")} />
        </div>
      </div>
    </div>
  );
}
// <CanvasRoomExpandedList rooms={other} />

type TCanvasRoomShortListProps = {
  rooms: TCanvasRoom[];
};

function CanvasRoomShortList({ rooms }: TCanvasRoomShortListProps) {
  return (
    <ul className="kpm-teaching-course-rooms">
      {rooms
        .filter((room: TCanvasRoom) => room.type !== "rapp")
        .map((room: TCanvasRoom) => {
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

  // Group by startTerm
  const groups: Record<string, any> = {};
  for (const room of rooms) {
    if (room.startTerm === undefined) {
      if (groups["other"] === undefined)
        groups["other"] = { vt: [], ht: [], other: [] };
      groups["other"]["other"].push(room);
      continue;
    }

    const year = room.startTerm!.slice(0, 4);
    const term = room.startTerm!.slice(4, 5);
    if (groups[year] === undefined)
      groups[year] = { vt: [], ht: [], other: [] };
    switch (term) {
      case "1":
        groups[year]["vt"].push(room);
        break;
      case "2":
        groups[year]["ht"].push(room);
        break;
      default:
        groups[year]["other"].push(room);
    }
  }

  const groupKeys = Object.keys(groups);
  groupKeys.sort((a, b) => (parseInt(b) || 0) - (parseInt(a) || 0));
  return (
    <DropdownMenuGroup title={title}>
      {groupKeys.map((year: string) => {
        return (
          <div className="kpm-course-rooms-dd-item">
            <h3>{year}</h3>
            <div className="kpm-col">
              {groups[year]?.["vt"].map((room: TCanvasRoom) => (
                <CanvasRoomLink
                  key={`${room.registrationCode}-${room.startTerm}`}
                  url={room.url}
                  type={room.type}
                  code={room.registrationCode}
                  startTerm={room.startTerm!}
                />
              ))}
              {groups[year]?.["other"].map((room: TCanvasRoom) => (
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
            <div className="kpm-col">
              {groups[year]?.["ht"].map((room: TCanvasRoom) => (
                <CanvasRoomLink
                  key={`${room.registrationCode}-${room.startTerm}`}
                  url={room.url}
                  type={room.type}
                  code={room.registrationCode}
                  startTerm={room.startTerm!}
                />
              ))}
            </div>
          </div>
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

function filterCanvasRooms(rooms: TCanvasRoom[]): {
  current: TCanvasRoom[];
  other: TCanvasRoom[];
  exams: TCanvasRoom[];
} {
  rooms.sort((a: TCanvasRoom, b: TCanvasRoom) => {
    const aVal = parseInt(a.startTerm || "0");
    const bVal = parseInt(b.startTerm || "0");
    if (aVal === bVal) return 0;
    if (aVal > bVal) return -1;
    return 1;
  });

  const exams = rooms.filter((c: TCanvasRoom) => c.type === "exam");
  const courseRooms = rooms.filter((c: TCanvasRoom) => c.type !== "exam");

  if (courseRooms.length <= 4) {
    return {
      current: courseRooms,
      other: [],
      exams,
    };
  }

  if (courseRooms.length === 0) {
    return {
      current: [],
      other: [],
      exams,
    };
  }

  return {
    current: courseRooms.slice(0, 3),
    other: courseRooms.slice(3),
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
          href={`https://www.kth.se/social/course/${courseCode}/editassistants/`}
        >
          {i18n("Administrera assistenter")}
        </a>
      </GroupItem>
      <GroupItem>
        <a href={`https://www.kth.se/social/course/${courseCode}/subgroup/`}>
          {i18n("Hantera Omgångar/grupper")}
        </a>
      </GroupItem>
      <GroupItem>
        <a
          href={`https://app.kth.se/studentlistor/kurstillfallen?courseCode=${courseCode}&term=${currentTerm}`}
        >
          {i18n("Kursdeltagare")}
        </a>
      </GroupItem>
      <GroupItem>
        <a href={`https://app.kth.se/kopps/admin/courses/${courseCode}/`}>
          {i18n("Kursinformation i Kopps")}
        </a>
      </GroupItem>
      <GroupItem>
        <a
          href={`https://app.kth.se/kursinfoadmin/kurser/kurs/edit/${courseCode}`}
        >
          {i18n("Redigera introduktion till kursen")}
        </a>
      </GroupItem>
      <GroupItem>
        <a href={`https://app.kth.se/kursinfoadmin/kurs-pm-data/${courseCode}`}>
          {i18n("Skapa och publicera kurs-PM")}
        </a>
      </GroupItem>
      <GroupItem>
        <a href={`https://www.kth.se/social/course/${courseCode}/survey/`}>
          {i18n("Kursvärdering")}
        </a>
      </GroupItem>
      <GroupItem>
        <a
          href={`https://app.kth.se/kursinfoadmin/kursutveckling/${courseCode}`}
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
        <a href={`https://www.kth.se/social/course/${courseCode}/students/`}>
          {i18n("Studentgruppen / Prenumeranter")}
        </a>
      </GroupItem>
      <GroupItem>
        <a
          href={`https://app.kth.se/aktivitetstillfallen/schema?courseCode=${courseCode}`}
        >
          {i18n("Sök tentamen")}
        </a>
      </GroupItem>
    </DropdownMenuGroup>
  );
}
