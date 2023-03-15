export type TGotErrType = "NotAvailable" | "BadResponse" | "TimeoutError";

export type TCorsError = "InvalidOrigin";

export type TSessionUser = {
  kthid: string;
  display_name: string;
  email?: string;
  username?: string;
  hasEduCourses?: boolean;
  hasLadokCourses?: boolean;
  numNewNotifications?: number;
  expires: number;
};
export type APISession = {
  user?: TSessionUser;
};

export type APILangErrType = TGotErrType; // We currently don't have any endpoint specific errors, see kpm-backend/.../lang.ts
export type APILang = {
  lang: string | null;
};
export type APILangParams = {
  lang: string | null;
};

export type APICanvasRoomsErrType = TGotErrType | "ValueError";
export type APICanvasRooms = {
  rooms: { [index: TCourseCode]: TCanvasRoom[] };
};

export type APITeachingErrType = TGotErrType | "ValueError";
export type APITeaching = {
  courses: Record<TCourseCode, TTeachingCourse>;
};

export type APIStudiesErrType = TGotErrType | "ValueError";
export type APIStudies = {
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
  creditUnitAbbr: TLocalizedString; // usually "hp", check other values!
  state: "ESTABLISHED" | "DEACTIVATED" | "CANCELLED";
  roles: TTeachingRole[];
  rooms: TCanvasRoom[] | null;
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
  creditUnitAbbr: TLocalizedString; // usually "hp", check other values!
  completed: boolean;
  rounds: TStudiesCourseRound[]; // any rounds that are current comes first.
  rooms: TCanvasRoom[] | null;
};
export type TStudiesCourseRound = {
  status: "antagna" | "registrerade";
  year: number;
  term: "1" | "2";
  ladokRoundId?: string;
  firstTuitionDate?: string; // "YYYY-MM-DD"
  lastTuitionDate?: string; // "YYYY-MM-DD"
  shortName?: string;
  current: boolean;
};

export type TStudiesProgramme = {
  type: "program";
  program_code: string;
  status?: "antagna" | "godkand" | "registrerade";
  year?: number;
  term?: "1" | "2";
};

export type APIGroupsErrType = TGotErrType | "ValueError";
export type APIGroups = {
  groups: TGroup[];
  group_search_url: string;
};
export type TGroup = {
  name: string;
  url: string;
  slug: string;
  starred: boolean;
};

export type APIProgrammesErrType = TGotErrType | "ValueError";
export type APIProgrammes = {
  programmes: TProgram[];
};
export type TProgram = {
  name: TLocalizedString;
  url: string;
  slug: string;
  starred: boolean;
};

export type APIServicesErrType = TGotErrType | "ValueError";
export type APIServices = {
  servicelinks: TService[];
  studentlinks: TService[];
};
export type TService = {
  name: string;
  url: string;
  info?: string;
};

export type APIAuthErrType = "ClientResponseError" | "TypeError";

export type APIMutedAuthErrType =
  | "LoginRequired"
  | "SessionExpired"
  | "SessionStoreError"
  | "AuthServiceMiscError"
  | "NoSessionUser";

export * from "./errors";
