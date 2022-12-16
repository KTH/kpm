import * as React from "react";
import {
  APIStudies,
  TStudiesCourse,
  TStudiesCourseRound,
} from "kpm-backend-interface";
import { MenuPane } from "../components/menu";
import { createApiUri, formatTerm, useDataFecther } from "./utils";
import { i18n } from "../i18n/i18n";

import "./studies.scss";
import {
  EmptyPlaceholder,
  ErrorMessage,
  LoadingPlaceholder,
} from "../components/common";
import { ExamRoomList } from "../components/courseComponents";

export async function loaderStudies({
  request,
}: any = {}): Promise<APIStudies> {
  const res = await fetch(createApiUri("/api/studies"), {
    signal: request?.signal,
    credentials: "include",
    headers: {
      // Explicitly set Accept header to avoid non 20x responses converted to HTML page by Everest
      Accept: "application/json",
    },
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

  const isEmpty = !loading && !error && Object.keys(courses || {}).length === 0;

  return (
    <MenuPane>
      {loading && <LoadingPlaceholder />}
      {error && <ErrorMessage error={error} />}
      {isEmpty && (
        <EmptyPlaceholder>
          {i18n("You aren't studying any courses.")}
        </EmptyPlaceholder>
      )}
      {courses && (
        <ul className="kpm-studies">
          {Object.entries(courses)?.map(([course_code, course]) => {
            return (
              <Course
                key={course_code}
                courseCode={course_code}
                course={course}
              />
            );
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

function RoundDesc({ round }: { round: TStudiesCourseRound }) {
  return (
    <React.Fragment>
      {i18n("term" + round.term)}
      {round.year % 100} ({round.shortName || round.ladokRoundId})
    </React.Fragment>
  );
}

function Course({ courseCode, course }: TCourseProps) {
  const [roundToShow, setRoundToShow] = React.useState(course.rounds?.[0]);
  // TODO: Try to find relevant room for selected round?
  const roomToShow = course.rooms?.[0] || undefined;
  const status = course.completed ? "godkand" : roundToShow?.status;
  const exams = course.rooms?.filter((c) => c.type === "exam");
  return (
    <div className={`kpm-studies-course kpm-${status}`}>
      <h2>
        {courseCode} <CourseStatus status={status} />
      </h2>
      <p>{i18n(course.title)}</p>
      {course.rounds?.length > 1 && (
        <select className="kpm-rounds">
          <option selected>Visa</option>
          {course.rounds.map((r) => (
            <option
              onClick={(e) => {
                setRoundToShow(r);
                const p = (e.target as Element).parentElement;
                (p as HTMLSelectElement).selectedIndex = 0;
                p?.blur();
              }}
            >
              <RoundDesc round={r} />
            </option>
          ))}
        </select>
      )}
      {roundToShow && (
        <h3>
          <RoundDesc round={roundToShow} />
        </h3>
      )}
      <ul>
        {status == "antagna" && (
          <li>
            <a href={getRegisterUrl(courseCode)}>{i18n("Registrera dig")}</a>
          </li>
        )}
        <li>
          <a href={getCourseInfoUrl(courseCode, roundToShow)}>
            {i18n("Kurs-PM")}
          </a>
        </li>
        <li>{roomToShow && <CanvasRoomLink {...roomToShow} />}</li>
      </ul>
      <ExamRoomList rooms={exams} title={i18n("Examinationsrum")} />
    </div>
  );
}

function getRegisterUrl(code: string) {
  return `#${code}`;
}

function getCourseInfoUrl(code: string, round?: TStudiesCourseRound) {
  if (round) {
    return `https://www.kth.se/kurs-pm/${code}/${round.year}${round.term}/${round.ladokRoundId}`;
  } else {
    return `https://www.kth.se/kurs-pm/${code}/`;
  }
}

type TCourseStatusProps = {
  status: "godkand" | TStudiesCourseRound["status"] | undefined;
};

function CourseStatus({ status }: TCourseStatusProps): JSX.Element | null {
  if (status === undefined) return null;

  return (
    <React.Fragment>
      |{" "}
      <span className={`kpm-studies-course-status kpm-${status}`}>
        {i18n(status)}
      </span>
    </React.Fragment>
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
