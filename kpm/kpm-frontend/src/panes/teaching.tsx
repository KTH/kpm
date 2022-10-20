import * as React from "react";
import { useLoaderData } from "react-router-dom";
import { APITeaching } from "kpm-backend-interface";
import { MenuPane } from "../components/menu";

export async function loaderTeaching({ request }: any): Promise<APITeaching> {
  const res = await fetch("/kpm/api/teaching", {
    signal: request.signal,
  });
  const json = await res.json();
  return json;
}

// TODO: Get types from backend?
export function Teaching() {
  const { courses } = useLoaderData() as APITeaching;
  return (
    <MenuPane>
      <h2>Teaching</h2>
      <ul className="kpm-teaching">
        {courses?.map((course) => {
          const { course_code, year, role, term, round_id } = course ?? {};
          const key = `${course_code}-${year}-${term}-${round_id}-${role}`;
          return (
            <Course
              key={key}
              courseCode={course_code}
              year={year}
              role={role}
            />
          );
        })}
      </ul>
    </MenuPane>
  );
}

function Course({ courseCode, year, role }: any) {
  return (
    <li className="kpm-teaching-course">
      <h2>{courseCode}</h2>
      <h3>
        {year} | {role}
      </h3>
    </li>
  );
}
