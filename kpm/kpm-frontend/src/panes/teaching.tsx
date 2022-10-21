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

  // Create two columns of courses, left to right
  const courseKeyCols: Array<Array<string>> = [
    [], []
  ];
  Object.keys(courses).forEach((key, i) => { courseKeyCols[i % 2].push(key) });

  return (
    <MenuPane>
      <div className="kpm-teaching">
        <div className="kpm-col">
          {courseKeyCols[0].map((course_code: string) => {
            return (
              <Course
                key={course_code}
                courseCode={course_code}
                courseRounds={courses[course_code]}
              />
            );
          })}
        </div>
        <div className="kpm-col">
          {courseKeyCols[1].map((course_code: string) => {
            return (
              <Course
                key={course_code}
                courseCode={course_code}
                courseRounds={courses[course_code]}
              />
            );
          })}
        </div>
      </div>
    </MenuPane>
  );
}

function Course({ courseCode, courseRounds }: any) {

  const courseName = "[course name missing]";
  const aboutCourseUrl = "[aboutCourseUrl missing]"
  const currentCourseRounds = getMostImportantCourseRounds(courseRounds);

  return (
    <div className="kpm-teaching-course">
      <h2>{courseCode}: {courseName}</h2>
      <a href={aboutCourseUrl}>Om kursen</a>
      <hr />
      <CourseRoundList courseRounds={currentCourseRounds} />
      <hr />
      <CollapsableGroup title="Administrera kurs">
        <GroupItem>One</GroupItem>
        <GroupItem>Two</GroupItem>
        <GroupItem>Three</GroupItem>
      </CollapsableGroup>
    </div>
  );
}

function CourseRoundList({ courseRounds }: any) {
  return (
    <ul>
      {courseRounds.map((course: any) => {
        const { year, role, term, round_id } = course ?? {};
        const key = `${year}-${term}-${round_id}-${role}`;
        return (
          <CourseRound key={key} url={"#todo"} year={year} term={term} roundId={round_id} />
        )
      })}
    </ul>
  )
}

function CourseRound({ url, year, term, roundId }: any) {
  return (
    <li className="kpm-teaching-course-round">
      <a href={url}>{formatTerm(term)}{year} ({roundId})</a>
    </li>
  );
}

function getMostImportantCourseRounds(courseRounds: TTeachingCourse[]): TTeachingCourse[] {
  const now = new Date();
  const outp = courseRounds.filter((c: any) => {
    return (
      c.year === now.getFullYear().toString()
    );
  });

  if (outp.length > 4) {
    return outp.slice(0, 4);
  }

  if (outp.length === 0) {
    const len = courseRounds.length;
    return courseRounds.slice(0, (len > 4 ? 4 : len));
  }
  
  return courseRounds;
}

function formatTerm(term: string) {
  switch (term) {
    case "1": return "VT";
    case "2": return "HT";
    default: return "??";
  }
}