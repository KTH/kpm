import * as React from "react";
import {
  APIStudies,
  TStudiesCourse,
  TStudiesCourseRound,
} from "kpm-backend-interface";
import { MenuPane } from "../components/menu";
import { fetchApi, formatTerm, useDataFecther } from "./utils";
import { i18n } from "../i18n/i18n";

import "./studies.scss";
import {
  AuthError,
  EmptyPlaceholder,
  ErrorMessage,
  LoadingPlaceholder,
} from "../components/common";
import { ExamRoomList } from "../components/courseComponents";
import { useEffect, useState } from "react";
import { FilterOption, TabFilter } from "../components/filter";

export async function loaderStudies({
  request,
}: any = {}): Promise<APIStudies> {
  const res = await fetchApi("/api/studies", {
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

type TFilter = "current" | "other";

function _isCurrentCourse(course: TStudiesCourse): boolean {
  return !!course.rounds.find((r) => r.current);
}

export function Studies() {
  const { res, loading, error } = useDataFecther<APIStudies>(loaderStudies);
  const { courses } = res || {};
  // const { courses, programmes } = useLoaderData() as APIStudies;
  const coursesArr = Object.entries(courses || {});

  const [filter, setFilter] = useState<TFilter>();

  // Switch to all if there are no starred programmes
  useEffect(() => {
    if (filter === undefined && coursesArr.length > 0) {
      const hasCurrent = !!coursesArr.find(([k, c]) =>
        c.rounds.find((r) => r.current)
      );
      setFilter(hasCurrent ? "current" : "other");
    }
  }, [courses]);

  const filteredCourseEntries = coursesArr.filter(([key, course]) => {
    switch (filter) {
      case "current":
        return _isCurrentCourse(course);
      case "other":
        return !_isCurrentCourse(course);
    }
  });

  const isEmpty = !loading && !error && filteredCourseEntries.length === 0;

  const coursesToShow = Object.fromEntries(filteredCourseEntries);

  return (
    <MenuPane error={error}>
      <TabFilter>
        <FilterOption<TFilter>
          value="current"
          filter={filter || "other"}
          onSelect={setFilter}
        >
          {i18n("Current Courses")}
        </FilterOption>
        <FilterOption<TFilter>
          value="other"
          filter={filter || "other"}
          onSelect={setFilter}
        >
          {i18n("Other")}
        </FilterOption>
      </TabFilter>
      {loading && <LoadingPlaceholder />}
      {error && <ErrorMessage error={error} />}
      {isEmpty && (
        <EmptyPlaceholder>
          {i18n("You aren't studying any courses.")}
        </EmptyPlaceholder>
      )}
      {coursesToShow && (
        <ul className="kpm-studies">
          {Object.entries(coursesToShow)?.map(([course_code, course]) => {
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
      {round.year % 100} ({i18n(round.shortName) || round.ladokRoundId})
    </React.Fragment>
  );
}

function Course({ courseCode, course }: TCourseProps) {
  const [roundToShow, setRoundToShow] = React.useState(course.rounds?.[0]);
  const status = course.completed ? "godkand" : roundToShow?.status;
  const exams = course.rooms?.filter((c) => c.type === "exam");
  const selTerm = roundToShow ? `${roundToShow.year}${roundToShow.term}` : null;
  // Show non-exams rooms for the selected term, but don't hide rooms w/o term.
  const filteredRooms = course.rooms?.filter(
    (c) =>
      c.type !== "exam" && (!c.startTerm || !selTerm || c.startTerm === selTerm)
  );

  // Sort course rounds so Omreg is before regular round
  course.rounds.sort((a, b) =>
    a.status === "omregistrerade" && b.status !== "omregistrerade" ? -1 : 0
  );

  return (
    <section className={`kpm-studies-course kpm-${status}`}>
      <h2>
        {courseCode} <CourseStatus status={status} />
      </h2>
      <p>{i18n(course.title)}</p>
      {course.rounds?.length > 1 && (
        <select className="kpm-rounds">
          <option selected>Visa</option>
          {course.rounds.map((r) => (
            <option
              key={`${r.status}-${r.year}-${r.term}`}
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
        <li>
          <a href={getCourseInfoUrl(courseCode, roundToShow)}>
            {i18n("Kurs-PM")}
          </a>
        </li>
        {filteredRooms?.map((r) => (
          <li>
            <CanvasRoomLink {...r} />
          </li>
        ))}
      </ul>
      <ExamRoomList rooms={exams} title={i18n("Examinationsrum")} />
      {course.rooms === null && (
        <p className="kpm-muted-text">
          {/* Show friendly warning if Canvas isn't responding */}
          {i18n("Canvas is silent, try later...")}
        </p>
      )}
      {course.rooms?.length === 0 && (
        <p className="kpm-muted-text">
          {/* Show friendly warning if Canvas isn't responding */}
          {i18n("No rooms found in Canvas")}
        </p>
      )}
    </section>
  );
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
