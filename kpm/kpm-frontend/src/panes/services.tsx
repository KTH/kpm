import React, { Fragment, useState } from "react";
import { MenuPane, MenuPaneHeader } from "../components/menu";
import { APIServices } from "kpm-backend-interface";
import { createApiUri, formatTerm, useDataFecther } from "./utils";
import {
  EmptyPlaceholder,
  ErrorMessage,
  LoadingPlaceholder,
} from "../components/common";
import { i18n } from "../i18n/i18n";
import "./services.scss";
import { IconSettings, IconStar } from "../components/icons";
import { FilterOption, TabFilter } from "../components/filter";

export async function loaderServices({
  request,
}: any = {}): Promise<APIServices> {
  const res = await fetch(createApiUri("/api/services"), {
    signal: request?.signal,
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

type TFilter = "favs" | "all";

export function Services() {
  const { res, loading, error } = useDataFecther<APIServices>(loaderServices);
  const { servicelinks, studentlinks } = res || {};

  const isEmptyServiceLinks = !loading && !error && servicelinks?.length === 0;
  const hasStudentlinks =
    Array.isArray(studentlinks) && studentlinks?.length > 0;
  const showStudentLinksWidget = error || hasStudentlinks;

  return (
    <MenuPane className="kpm-services">
      <MenuPaneHeader title={i18n("My Services")}>
        <a
          title="Help / feedback for the personal menu in connection with the transition to new Ladok"
          href="https://www.kth.se/social/group/feedback-fran-anvand/page/personliga-menyn/"
        >
          Help / feedback
        </a>
        <IconSettings href="https://www.kth.se/social/servicelinks" />
      </MenuPaneHeader>
      <Fragment>
        <div className="kpm-col">
          <h3 className="kpm-col-header">{i18n("LADOK for Students")}</h3>
          <ul>
            <li>
              <h4>
                <a href="https://www.student.ladok.se/student/app/studentwebb/start">
                  Home page
                </a>
              </h4>
              <p>
                Relevant information right now. Course registration, Exam
                registration
              </p>
            </li>
            <li>
              <h4>
                <a href="https://www.student.ladok.se/student/app/studentwebb/min-utbildning/alla">
                  My education
                </a>
              </h4>
              <p>
                Overview of your studies. Programmes, courses, results on
                courses
              </p>
            </li>
            <li>
              <h4>
                <a href="https://www.student.ladok.se/student/app/studentwebb/examinationstillfallen/oppna-for-anmalan">
                  Examinations
                </a>
              </h4>
              <p>Sign up for examinations</p>
            </li>
            <li>
              <h4>
                <a href="https://www.student.ladok.se/student/app/studentwebb/intyg">
                  Transcripts
                </a>
              </h4>
            </li>
            <li>
              <h4>
                <a href="https://www.student.ladok.se/student/app/studentwebb/examen-bevis">
                  Degree Certificate
                </a>
              </h4>
              <p>Apply for degree certificate</p>
            </li>
          </ul>
        </div>
        <div className="kpm-col kpm-services-links">
          <h3 className="kpm-col-header">{i18n("Other Selected Services")}</h3>
          {loading && <LoadingPlaceholder />}
          {error && <ErrorMessage error={error} />}
          {isEmptyServiceLinks && (
            <EmptyPlaceholder>
              {i18n("You have no service links.")}
            </EmptyPlaceholder>
          )}
          {!isEmptyServiceLinks && (
            <ul>
              {servicelinks?.map((links) => (
                <li key={links.url}>
                  <h4>
                    <a href={links.url}>{i18n(links.name)}</a>
                  </h4>
                </li>
              ))}
            </ul>
          )}
        </div>
        {showStudentLinksWidget && (
          <div className="kpm-col">
            <h3 className="kpm-col-header">{i18n("Services for Students")}</h3>
            {loading && <LoadingPlaceholder />}
            {error && <ErrorMessage error={error} />}
            {hasStudentlinks && (
              <ul>
                {studentlinks?.map((links) => (
                  <li key={links.url}>
                    <h4>
                      <a href={links.url}>{i18n(links.name)}</a>
                    </h4>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Fragment>
    </MenuPane>
  );
}
