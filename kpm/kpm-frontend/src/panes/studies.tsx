import * as React from "react";
import { useLoaderData } from "react-router-dom";
import { APIStudies } from "kpm-backend-interface";
import { MenuPane } from "../components/menu";
import { CanvasRoomShortList } from "./teaching";

import "./studies.scss";

export async function loaderStudies({ request }: any): Promise<APIStudies> {
  const res = await fetch("/kpm/api/studies", {
    signal: request.signal,
  });
  const json = await res.json();
  return json;
}

export function Studies() {
  const { courses, programmes } = useLoaderData() as APIStudies;
  return (
    <MenuPane>
      <h2>Studies</h2>
      <ul className="kpm-studies">
        {Object.entries(courses)?.map((course_code, course) => {
          return <Course courseCode={course_code} course={course} />;
        })}
      </ul>
    </MenuPane>
  );
}

function Course({ courseCode, course }: any) {
  return (
    <li className="kpm-studies-course">
      <h2>
        {courseCode} {course.title.sv} {course.credits} {course.creditUnitAbbr}
      </h2>
      <CanvasRoomShortList rooms={course.rooms} />
    </li>
  );
}
