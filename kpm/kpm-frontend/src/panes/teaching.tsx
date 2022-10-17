import * as React from 'react';
import {
  useLoaderData,
} from "react-router-dom";
import { MenuPane } from "../components/menu";

export async function loaderTeaching({ request }: any) {
  const res = await fetch("/kpm/api/teaching", {
    signal: request.signal,
  });
  const json = await res.json();
  return json;
}

// TODO: Get types from backend?
export function Teaching() {
  const { teaching } = useLoaderData() as { teaching: { course_code: string, year: string, role: string }[] };
  return (
    <MenuPane>
      <h2>Teaching</h2>
      <ul className="kpm-teaching">
        {teaching?.map(course => {
          const { course_code, year, role } = course ?? {};
          return <Course courseCode={course_code} year={year} role={role} />
        })}
      </ul>
    </MenuPane>
  )
}

function Course({ courseCode, year, role }: any) {
  return (
    <li className="kpm-teaching-course">
      <h2>{courseCode}</h2>
      <h3>{year} | {role}</h3>
    </li>
  )
}