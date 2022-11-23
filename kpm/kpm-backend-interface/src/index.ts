export type TGotErrType = "NotAvailable" | "BadResponse" | "TimeoutError";

// TODO: ValueError is just a marker to see what this looks like
export type TCanvasRoomsEndpointErrType = TGotErrType | "ValueError";
export type TCanvasRoomsEndpoint = {
  rooms: { [index: TCourseCode]: TCanvasRoom[] };
};

export type TTeachingEndpointErrType = TGotErrType | "ValueError";
export type TTeachingEndpoint = {
  courses: Record<TCourseCode, TTeachingCourse>;
};

export type TStudiesEndpointErrType = TGotErrType | "ValueError";
export type TStudiesEndpoint = {
  courses: Record<TCourseCode, TStudiesCourse>;
  programmes: Record<TProgramCode, TStudiesProgramme[]>;
};

export type TCourseCode = string;
export type TProgramCode = string;

// QUESTION: Should we import types from the API-packages? Should these types be moved to separate packages?
// Same as type Link in my-canvas-rooms-api/src/api.ts
export type TCanvasRoom = {
  url: URL;
  name: string;
  state: "unpublished" | "available" | "completed" | "deleted";
  text?: string;
  type: "course" | "exam" | "rapp" | undefined;
  startTerm?: string; // YYYYn (n = 1 | 2)
  examDate?: string; // YYYY-mm-dd
  registrationCode?: string; // Often a five-digit number, but may vary.
  favorite: boolean;
};

export type TLocalizedString = {
  sv: string;
  en: string;
};

export type TTeachingCourse = {
  course_code: TCourseCode;
  title: TLocalizedString;
  credits: number;
  creditUnitAbbr: string; // usually "hp", check other values!
  roles: TTeachingRole[];
  rooms: TCanvasRoom[];
};

export type TTeachingRole = {
  role: "courseresponsible" | "teachers" | "assistants" | "examiner";
  round_id: string;
  term: "1" | "2";
  year: string;
};

export type TStudiesCourse = {
  course_code: TCourseCode;
  title: TLocalizedString;
  credits: number;
  creditUnitAbbr: string; // usually "hp", check other values!
  roles: TStudiesCourseInner[];
  rooms: TCanvasRoom[];
};
export type TStudiesCourseInner = {
  status?: "antagna" | "godkand" | "registrerade";
  year?: number;
  term?: "1" | "2";
  round?: string;
};

export type TStudiesProgramme = {
  type: "program";
  program_code: string;
  status?: "antagna" | "godkand" | "registrerade";
  year?: number;
  term?: "1" | "2";
};

export type TGroupsEndpointErrType = TGotErrType | "ValueError";
export type APIGroups = {
  groups: TGroup[];
  group_search_url: string;
};
export type TGroup = {
  name: string;
  url: string;
  starred: boolean;
};

export type TProgrammesEndpointErrType = TGotErrType | "ValueError";
export type TProgrammesEndpoint = {
  programmes: TProgram[];
};
export type TProgram = {
  name: TLocalizedString;
  url: string;
  slug: string;
  starred: boolean;
};

export type TServicesEndpointErrType = TGotErrType | "ValueError";
export type TServicesEndpoint = {
  servicelinks: TService[];
  studentlinks: TService[];
};
export type TService = {
  name: string;
  url: string;
};

export * from "./errors";
