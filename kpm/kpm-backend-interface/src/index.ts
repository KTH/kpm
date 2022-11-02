export type APICanvasRooms = {
  rooms: { [index: TCourseCode]: TCanvasRoom[] };
};

export type APITeaching = {
  courses: Record<TCourseCode, TTeachingCourse>;
};

export type APIStudies = {
  courses: TStudiesCourse[];
  programmes: TStudiesProgramme[];
};

export type TCourseCode = string;

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
  type: "kurser";
  code: string;
  code_pt1: string;
  code_pt2: string;
  status?: "antagna" | "godkand" | "registrerade";
  year: string;
  term: "1" | "2" | "3" | "4";
  round: "1" | "2";
};

export type TStudiesProgramme = {
  type: "program";
  code: string;
  status?: "registrerade" | "antagna" | "godkand";
  year: string;
  term: "1" | "2" | "3" | "4";
};
