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

export type TTeachingCourse = {
  course_code: TCourseCode;
  title: { sv: string; en: string };
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
  title: { sv: string; en: string };
  credits: number;
  creditUnitAbbr: string; // usually "hp", check other values!
  roles: TStuidesCourseInner[];
  rooms: TCanvasRoom[];
};
export type TStuidesCourseInner = {
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
