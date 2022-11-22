import * as React from "react";
import {
  APIStudies,
  TStudiesCourse,
  TStudiesCourseInner,
} from "kpm-backend-interface";
import { MenuPane } from "../components/menu";
import { createApiUri, formatTerm, useDataFecther } from "./utils";
import { i18n } from "../i18n/i18n";

import "./studies.scss";
import { ErrorMessage, LoadingPlaceholder } from "../components/common";

export async function loaderStudies({
  request,
}: any = {}): Promise<APIStudies> {
  const res = await fetch(createApiUri("/api/studies"), {
    signal: request?.signal,
  });
  const json = await res.json();
  if (res.ok) {
    return json;
  } else {
    // TODO: Handle more kinds of errors or keep it simple?
    throw new Error(json.message);
  }
}

export function Studies() {
  const { res, loading, error } = useDataFecther<APIStudies>(loaderStudies);
  const { courses } = res || {};
  // const { courses, programmes } = useLoaderData() as APIStudies;
  return (
    <MenuPane>
      {loading && <LoadingPlaceholder />}
      {error && <ErrorMessage error={error} />}
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

type TCourseProps = {
  courseCode: string;
  course: TStudiesCourse;
};

function Course({ courseCode, course }: TCourseProps) {
  const roleToShow = course.roles[0];
  const roomToShow = course.rooms?.[0] || undefined;
  return (
    <div className={`kpm-studies-course kpm-${roleToShow.status}`}>
      <CourseStatus status={roleToShow.status} />
      <h2>
        {courseCode.toString()} {i18n(course.title)} {course.credits}{" "}
        {i18n(course.creditUnitAbbr)}
      </h2>
      <ul>
        <li>
          <a href={getRegisterUrl(courseCode)}>{i18n("Registrera dig")}</a>
        </li>
        <li>
          <a href={getCourseInfoUrl(courseCode)}>
            {i18n("Kurs-PM")}{" "}
            {roomToShow?.startTerm && formatTerm(roomToShow.startTerm)}
          </a>
        </li>
        <li>{roomToShow && <CanvasRoomLink {...roomToShow} />}</li>
      </ul>
      {/* TODO: Show examinationsrum */}
    </div>
  );
}

function getRegisterUrl(code: string) {
  return `#${code}`;
}

function getCourseInfoUrl(code: string) {
  return `#${code}`;
}

type TCourseStatusProps = {
  status: TStudiesCourseInner["status"];
};

function CourseStatus({ status }: TCourseStatusProps): JSX.Element | null {
  if (status === undefined) return null;

  return (
    <div className={`kpm-studies-course-status kpm-${status}`}>
      {i18n(status)}
    </div>
  );
}

type TCanvasRoomLinkProps = {
  url: URL | string;
  startTerm?: string;
};

export function CanvasRoomLink({ url, startTerm }: TCanvasRoomLinkProps) {
  // This is a Component to force consistency
  return (
    <a href={typeof url === "string" ? url : url.href}>
      {i18n("Kursen")} {startTerm && formatTerm(startTerm)} {i18n("i Canvas")}
    </a>
  );
}
