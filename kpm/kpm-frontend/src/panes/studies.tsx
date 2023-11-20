import * as React from "react";
import {
  APIStudies,
  TStudiesCourse,
  TStudiesCourseRound,
} from "kpm-backend-interface";
import { MenuPane } from "../components/menu";
import { fetchApi, formatTerm } from "./utils";
import { useDataFecther } from "../hooks/dataFetcher";
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

export async function fetchStudies(): Promise<APIStudies> {
  const res = await fetchApi("/api/studies");
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

export function Studies() {
  const { res, loading, error } = useDataFecther<APIStudies>(loaderStudies);
  const { courses } = res || {};
  // const { courses, programmes } = useLoaderData() as APIStudies;
  const coursesArr = Object.entries(courses || {});

  const [filter, setFilter] = useState<TFilter>();

  // Switch to all if there are no starred programmes
  useEffect(() => {
    if (filter === undefined && coursesArr.length > 0) {
      const hasCurrent = !!coursesArr.find(([k, c]) => c.current);
      setFilter(hasCurrent ? "current" : "other");
    }
  }, [courses]);

  const filteredCourseEntries = coursesArr.filter(([key, course]) => {
    switch (filter) {
      case "current":
        return course.current;
      case "other":
        return !course.current;
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

function RoundDesc({ round }: { round?: TStudiesCourseRound }) {
  if (round === undefined)
    return <React.Fragment>{i18n("om_kursen")}</React.Fragment>;

  return (
    <React.Fragment>
      {i18n("term" + round.term)}
      {round.year % 100} (
      {round.shortName === "omreg_lbl"
        ? i18n(round.shortName)
        : round.ladokRoundId}
      )
    </React.Fragment>
  );
}

function _genRoundKey(round?: TStudiesCourseRound) {
  if (round === undefined) return "noop";
  return `${round.status}-${round.year}-${round.term}-${round.ladokRoundId}`;
}

function Course({ courseCode, course }: TCourseProps) {
  // Start by showing most recent current round
  const [roundToShow, setRoundToShow] = React.useState(
    course.rounds?.reduce(
      (val: TStudiesCourseRound | undefined, r) => r || val,
      undefined
    )
  );
  const status = course.completed ? "godkand" : roundToShow?.status;
  const exams = course.rooms?.filter((c) => c.type === "exam");
  const selTerm = roundToShow ? `${roundToShow.year}${roundToShow.term}` : null;

  // Show non-exams rooms for the selected term, but don't hide rooms w/o term.
  const filteredRooms = course.rooms?.filter(
    (c) =>
      c.type !== "exam" && (!c.startTerm || !selTerm || c.startTerm === selTerm)
  );

  return (
    <section className={`kpm-studies-course kpm-${status}`}>
      <h2>
        {courseCode} <CourseStatus status={status} />
      </h2>
      <p>{i18n(course.title)}</p>
      {course.rounds?.length > 1 && (
        <select
          className="kpm-rounds"
          onChange={(e) => {
            const round = course.rounds.find(
              (r) => _genRoundKey(r) === e.target.value
            ) as TStudiesCourseRound;
            setRoundToShow(round);
            const p = (e.target as Element).parentElement;
            (p as HTMLSelectElement).selectedIndex = 0;
            p?.blur();
          }}
          value={_genRoundKey(roundToShow)}
        >
          {course.rounds.map((r) => (
            <option key={_genRoundKey(r)} value={_genRoundKey(r)}>
              <RoundDesc round={r} />
            </option>
          ))}
        </select>
      )}
      {course.rounds?.length <= 1 && (
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
        {filteredRooms?.map((r, index) => (
          <li key={index}>
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
  if (round?.applicationCode !== undefined) {
    return `https://www.kth.se/kurs-pm/${code}/${code}${round.year}${round.term}-${round.applicationCode}`;
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
