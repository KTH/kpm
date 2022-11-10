import * as React from "react";
import { useLoaderData } from "react-router-dom";
import {
  APITeaching,
  TCanvasRoom,
  TTeachingCourse,
} from "kpm-backend-interface";
import { MenuPane } from "../components/menu";
import {
  CollapsableGroup,
  DropdownMenuGroup,
  GroupItem,
} from "../components/groups";
import { i18n } from "./i18n";

import "./teaching.scss";

export async function loaderTeaching({ request }: any): Promise<APITeaching> {
  const res = await fetch("/kpm/api/teaching", {
    signal: request.signal,
  });
  const json = await res.json();
  return json;
}

export function Teaching() {
  const { courses } = useLoaderData() as APITeaching;

  return (
    <MenuPane>
      <div className="kpm-teaching">
        {Object.entries(courses).map(([code, course]) => {
          return <Course key={[code]} courseCode={code} course={course} />;
        })}
      </div>
    </MenuPane>
  );
}

function Course({ courseCode, course }: any) {
  const courseName = i18n(course.title); // TODO: perhaps convert i18n to i18nHook that fetches language and returns i18n function
  const aboutCourseUrl = `https://www.kth.se/kurs-pm/${courseCode}/om-kurs-pm`;
  // TODO: These should be changed to course rooms, check backend
  const { current, other } = filterCanvasRooms(course.rooms);
  const currentTerm = "HT2022";

  return (
    <div className="kpm-teaching-course">
      <h2>{courseCode}</h2>
      <div className="kpm-row">
        <p>{courseName}</p>
        <a href={aboutCourseUrl}>Om kursen (kurs-PM m.m.)</a>
        <CourseAdminDropdown
          courseCode={courseCode}
          currentTerm={currentTerm}
        />
        <div className="kpm-row">
          <h3>Canvas:</h3>
          <CanvasRoomShortList rooms={current} />
          <CanvasRoomExpandedList
            rooms={[...current, ...other]}
            title="Alla kursrum"
          />
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
      {rooms.map((room: TCanvasRoom) => {
        return (
          <li key={room.startTerm}>
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
          <div className="kpm-teaching-course-rooms-dd-item">
            <h3>{year}</h3>
            <div className="kpm-col">
              {groups[year]?.["vt"].map((room: TCanvasRoom) => (
                <CanvasRoomLink
                  url={room.url}
                  type={room.type}
                  code={room.registrationCode}
                  startTerm={room.startTerm!}
                />
              ))}
              {groups[year]?.["other"].map((room: TCanvasRoom) => (
                <CanvasRoomLink
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
  url: URL;
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
    <a href={url.href}>
      {startTerm && formatTerm(startTerm)} {`(${code || type || "?"})`}
    </a>
  );
}

function filterCanvasRooms(rooms: TCanvasRoom[]): {
  current: TCanvasRoom[];
  other: TCanvasRoom[];
} {
  const outp = [...rooms];

  outp.sort((a: TCanvasRoom, b: TCanvasRoom) => {
    const aVal = parseInt(a.startTerm || "0");
    const bVal = parseInt(b.startTerm || "0");
    if (aVal === bVal) return 0;
    if (aVal > bVal) return -1;
    return 1;
  });

  if (outp.length <= 4) {
    return {
      current: outp,
      other: [],
    };
  }

  if (outp.length === 0) {
    return {
      current: [],
      other: [],
    };
  }

  return {
    current: outp.slice(0, 3),
    other: outp.slice(3),
  };
}

function formatTerm(startTerm: string) {
  const shortYear = startTerm.slice(2, 4);
  const termNr = startTerm.slice(4, 5);
  const termStr = { 1: "VT", 2: "HT" }[termNr];
  return `${termStr}${shortYear}`;
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
      title="Administrera kurs"
      className="kpm-teaching-course-admin-dropdown"
    >
      <GroupItem>
        <a
          href={`https://www.kth.se/social/course/${courseCode}/editassistants/`}
        >
          Administrera assistenter
        </a>
      </GroupItem>
      <GroupItem>
        <a href={`https://www.kth.se/social/course/${courseCode}/subgroup/`}>
          Hantera Omgångar/grupper
        </a>
      </GroupItem>
      <GroupItem>
        <a
          href={`https://app.kth.se/studentlistor/kurstillfallen?courseCode=${courseCode}&term=${currentTerm}`}
        >
          Kursdeltagare
        </a>
      </GroupItem>
      <GroupItem>
        <a href={`https://app.kth.se/kopps/admin/courses/${courseCode}/`}>
          Kursinformation i Kopps
        </a>
      </GroupItem>
      <GroupItem>
        <a
          href={`https://app.kth.se/kursinfoadmin/kurser/kurs/edit/${courseCode}`}
        >
          Redigera introduktion till kursen
        </a>
      </GroupItem>
      <GroupItem>
        <a href={`https://app.kth.se/kursinfoadmin/kurs-pm-data/${courseCode}`}>
          Skapa och publicera kurs-PM
        </a>
      </GroupItem>
      <GroupItem>
        <a href={`https://www.kth.se/social/course/${courseCode}/survey/`}>
          Kursvärdering
        </a>
      </GroupItem>
      <GroupItem>
        <a
          href={`https://app.kth.se/kursinfoadmin/kursutveckling/${courseCode}`}
        >
          Publicera ny kursanalys
        </a>
      </GroupItem>
      <GroupItem>
        <a
          href={`https://www.start.ladok.se/Shibboleth.sso/Login?entityID=https%3A%2F%2Fsaml.sys.kth.se%2Fidp%2Fshibboleth&target=https%3A%2F%2Fwww.start.ladok.se%2Fgui%2Fshiblogin%23%2Fsok%2Fkurstillfalle%3Fkurskod%3D${courseCode}`}
        >
          Se provresultat
        </a>
      </GroupItem>
      <GroupItem>
        <a href={`https://www.kth.se/social/course/${courseCode}/students/`}>
          Studentgruppen / Prenumeranter
        </a>
      </GroupItem>
      <GroupItem>
        <a
          href={`https://app.kth.se/aktivitetstillfallen/schema?courseCode=${courseCode}`}
        >
          Sök tentamen
        </a>
      </GroupItem>
    </DropdownMenuGroup>
  );
}
