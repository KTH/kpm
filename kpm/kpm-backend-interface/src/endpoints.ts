import { TGotErrType } from "./errors";
import {
  TCanvasRoom,
  TCourseCode,
  TGroup,
  TProgramCode,
  TService,
  TSessionUser,
  TStudiesCourse,
  TStudiesProgramme,
  TTeachingCourse,
} from "./entities";

/**
 * API Endpoint Payload Types
 *
 * Each endpoint has a payload type definition and an error type definition.
 *
 * The error definition shows what errors you MUST handle in the frontend
 * when calling the endpoint. The error response payload is defined in
 * ./errors.ts.
 */

export type APISession = {
  user?: TSessionUser;
};

export type APILangErrType = TGotErrType; // We currently don't have any endpoint specific errors, see kpm-backend/.../lang.ts
export type APILang = {
  lang: string | null;
};
export type APISetLangParams = {
  lang: string | null;
};

export type APICanvasRoomsErrType = TGotErrType | "ValueError";
export type APICanvasRooms = {
  courseRooms: { [index: TCourseCode]: TCanvasRoom[] } | null;
  programRooms: { [index: TCourseCode]: TCanvasRoom } | null;
};

export type APITeachingErrType = TGotErrType | "ValueError";
export type APITeaching = {
  courses: { [index: TCourseCode]: TTeachingCourse };
};

export type APIStudiesErrType = TGotErrType | "ValueError";
export type APIStudies = {
  courses: { [index: TCourseCode]: TStudiesCourse };
  programmes: { [index: TProgramCode]: TStudiesProgramme[] }; // TODO: This probably needs to be fixed
};

export type APIGroupsErrType = TGotErrType | "ValueError";
export type APIGroups = {
  groups: TGroup[];
  group_search_url: string;
};

export type APIProgrammesErrType = TGotErrType | "ValueError";
export type APIProgrammes = {
  programRooms: { [index: TCourseCode]: TCanvasRoom } | null;
};

export type APIServicesErrType = TGotErrType | "ValueError";
export type APIServices = {
  servicelinks: TService[];
  studentlinks: TService[];
};
