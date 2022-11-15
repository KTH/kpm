import * as React from "react";
import { useLoaderData } from "react-router-dom";
import { APIStudies, TCanvasRoom } from "kpm-backend-interface";
import { MenuPane } from "../components/menu";
import { CanvasRoomLink } from "./teaching";
import { createApiUri, useDataFecther } from "./utils";
import { i18n } from "./i18n";

import "./studies.scss";
import { ErrorMessage, LoadingPlaceholder } from "../components/common";

export async function loaderStudies({
  request,
}: any = {}): Promise<APIStudies> {
  const res = await fetch(createApiUri("/api/studies"), {
    signal: request?.signal,
  });
  const json = await res.json();
  return json;
}

export function Studies() {
  const { res, loading, error } = useDataFecther<APIStudies>(loaderStudies);
  const { courses } = res || {};
  // const { courses, programmes } = useLoaderData() as APIStudies;
  return (
    <MenuPane>
      {loading && <LoadingPlaceholder />}
      {error && <ErrorMessage error={error} />}
      {courses && <h2>Studies</h2>}
      {courses && (
        <ul className="kpm-studies">
          {Object.entries(courses)?.map(([course_code, course]) => {
            return <Course courseCode={course_code} course={course} />;
          })}
        </ul>
      )}
    </MenuPane>
  );
}

function Course({ courseCode, course }: any) {
  return (
    <li className="kpm-studies-course">
      <h2>
        {courseCode.toString()} {i18n(course.title)} {course.credits}{" "}
        {course.creditUnitAbbr}
      </h2>
      {course.rooms?.map((room: TCanvasRoom) => (
        <CanvasRoomLink {...room} />
      ))}
    </li>
  );
}
