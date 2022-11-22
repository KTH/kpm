export type APICanvasRooms = {
  rooms: { [index: TCourseCode]: TCanvasRoom[] };
};

export type APITeaching = {
  courses: Record<TCourseCode, TTeachingCourse>;
};

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

export type TAPIGroupsEndpointError = "NotAvailable" | "";
export type APIGroups = {
  groups: TGroup[];
  group_search_url: string;
};
export type TGroup = {
  name: string;
  url: string;
  starred: boolean;
};

export type APIProgrammes = {
  programmes: TProgram[];
};
export type TProgram = {
  name: TLocalizedString;
  url: string;
  slug: string;
  starred: boolean;
};

export type APIServices = {
  servicelinks: TService[];
  studentlinks: TService[];
};
export type TService = {
  name: string;
  url: string;
};

export * from './errors';
