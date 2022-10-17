import * as React from 'react';
import {
  useLoaderData,
} from "react-router-dom";
import { APIStudies } from 'kpm-backend-interface';
import { MenuPane } from "../components/menu";

export async function loaderStudies({ request }: any) : Promise<APIStudies> {
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
        {courses?.map(course => {
          const { code, status, year } = course ?? {};
          const key = `${code}-${year}`;
          return <Course key={key} courseCode={code} year={year} status={status} />
        })}
      </ul>
    </MenuPane>
  )
}

function Course({ courseCode, year, status }: any) {
  return (
    <li className="kpm-studies-course">
      <h2>{courseCode}</h2>
      <h3>{year} | {status}</h3>
    </li>
  )
}