import * as React from "react";
import { useLoaderData } from "react-router-dom";
import { APITeaching, TTeachingCourse } from "kpm-backend-interface";
import { MenuPane } from "../components/menu";
import { CollapsableGroup, GroupItem } from "../components/groups";

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
        {Object.keys(courses).map((course_code: string) => {
          return (
            <Course
              key={course_code}
              courseCode={course_code}
              courseRounds={courses[course_code]}
            />
          );
        })}
      </div>
    </MenuPane>
  );
}

function Course({ courseCode, courseRounds }: any) {

  const courseName = "[course name missing]";
  const aboutCourseUrl = "[aboutCourseUrl missing]"
  // TODO: These should be changed to course rooms, check backend
  const { current, other } = filterCanvasRooms(courseRounds);
  const currentTerm = "HT2022";

  return (
    <div className="kpm-teaching-course">
      <h2>{courseCode}: {courseName}</h2>
      <a href={aboutCourseUrl}>Om kursen</a>
      <hr />
      <CanvasRoomShortList rooms={current} />
      <CanvasRoomExpandedList rooms={other} />
      <hr />
      <CollapsableGroup title="Administrera kurs">
        <GroupItem><a href={`https://www.kth.se/social/course/${courseCode}/editassistants/`}>Administrera assistenter</a></GroupItem>
        <GroupItem><a href={`https://www.kth.se/social/course/${courseCode}/subgroup/`}>Hantera Omgångar/grupper</a></GroupItem>
        <GroupItem><a href={`https://app.kth.se/studentlistor/kurstillfallen?courseCode=${courseCode}&term=${currentTerm}`}>Kursdeltagare</a></GroupItem>
        <GroupItem><a href={`https://app.kth.se/kopps/admin/courses/${courseCode}/`}>Kursinformation i Kopps</a></GroupItem>
        <GroupItem><a href={`https://app.kth.se/kursinfoadmin/kurser/kurs/edit/${courseCode}`}>Redigera introduktion till kursen</a></GroupItem>
        <GroupItem><a href={`https://app.kth.se/kursinfoadmin/kurs-pm-data/${courseCode}`}>Skapa och publicera kurs-PM</a></GroupItem>
        <GroupItem><a href={`https://www.kth.se/social/course/${courseCode}/survey/`}>Kursvärdering</a></GroupItem>
        <GroupItem><a href={`https://app.kth.se/kursinfoadmin/kursutveckling/${courseCode}`}>Publicera ny kursanalys</a></GroupItem>
        <GroupItem><a href={`https://www.start.ladok.se/Shibboleth.sso/Login?entityID=https%3A%2F%2Fsaml.sys.kth.se%2Fidp%2Fshibboleth&target=https%3A%2F%2Fwww.start.ladok.se%2Fgui%2Fshiblogin%23%2Fsok%2Fkurstillfalle%3Fkurskod%3D${courseCode}`}>Se provresultat</a></GroupItem>
        <GroupItem><a href={`https://www.kth.se/social/course/${courseCode}/students/`}>Studentgruppen / Prenumeranter</a></GroupItem>
        <GroupItem><a href={`https://app.kth.se/aktivitetstillfallen/schema?courseCode=${courseCode}`}>Sök tentamen</a></GroupItem>
      </CollapsableGroup>
    </div>
  );
}

function CanvasRoomShortList({ rooms }: any) {
  return (
    <ul>
      {rooms.map(({ year, role, term, round_id }: any) => {
        const key = `${year}-${term}-${round_id}-${role}`;
        return <li><CanvasRoomItem key={key} url={"#TODO"} term={term} year={year} roundId={round_id} /></li>
      })}
    </ul>
  )
}

function CanvasRoomExpandedList({ rooms }: any) {
  // Only show this if it has any items
  if (rooms.length === 0) return null;

  return (
    <CollapsableGroup title="Äldre kursrum">
      {rooms.map(({ year, role, term, round_id }: any) => {
        const key = `${year}-${term}-${round_id}-${role}`;
        return <GroupItem><CanvasRoomItem key={key} url={"#TODO"} term={term} year={year} roundId={round_id} /></GroupItem>
      })}
    </CollapsableGroup>
  )
}

function CanvasRoomItem({ url, term, year, roundId }: any) {
  // This is a Component to force consistency
  return <a href={url}>{formatTerm(term)}{year} ({roundId})</a>;
}

function filterCanvasRooms(rooms: TTeachingCourse[]): { current: TTeachingCourse[], other: TTeachingCourse[] } {
  const now = new Date();
  const outp = [...rooms];

  outp.sort((a: TTeachingCourse, b: TTeachingCourse) => {
    try {
      return (parseInt(a.year) - parseInt(b.year)) % 1;
    } catch (e) {
      return 0;
    }
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
    current: outp.slice(0, 4),
    other: outp.slice(4),
  };
}

function formatTerm(term: string) {
  switch (term) {
    case "1": return "VT";
    case "2": return "HT";
    default: return "??";
  }
}