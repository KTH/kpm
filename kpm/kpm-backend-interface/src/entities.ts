export type TLocalizedString = {
  sv: string;
  en: string;
};

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

export type TCourseCode = string;
export type TProgramCode = string;

// QUESTION: Should we import types from the API-packages? Should these types be moved to separate packages?
// Same as type Link in my-canvas-rooms-api/src/api.ts
export type TCanvasRoom = {
  url: URL;
  name: string;
  state: "unpublished" | "available" | "completed" | "deleted";
  text?: string;
  type: "course" | "exam" | "rapp" | "program" | undefined;
  startTerm?: string; // YYYYn (n = 1 | 2)
  examDate?: string; // YYYY-mm-dd
  registrationCode?: string; // Often a five-digit number, but may vary.
  favorite: boolean;
};

export type TGroup = {
  name: string;
  url: string;
  slug: string;
  starred: boolean;
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

export type TTeachingCourse = {
  course_code: TCourseCode;
  title: TLocalizedString;
  credits: number;
  creditUnitAbbr: TLocalizedString; // usually "hp", check other values!
  state: "ESTABLISHED" | "DEACTIVATED" | "CANCELLED";
  roles: TTeachingRole[];
  rooms: TCanvasRoom[] | null; // TODO: The API doesn't return null, investigate if it should
  starred: boolean;
};

export type TStudiesProgramme = {
  type: "program";
  program_code: string;
  status?: "antagna" | "godkand" | "registrerade";
  year?: number;
  term?: "1" | "2";
};

export type TProgram = {
  // name: TLocalizedString;
  // url: string;
  // slug: string;
  // starred: boolean;
};

export type TService = {
  name: string;
  url: string;
  info?: string;
};
