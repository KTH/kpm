/**
 * API Endpoint Payload Types
 *
 * Each endpoint has a payload type definition and an error type definition.
 */
export type APIUserStudies = {
  courses: Record<TCourseCode, TUserCourse[]>;
  programmes: Record<TProgramCode, TUserProgram[]>;
};

// TODO: Missing APIXXXErrType definitions

export const STUDENT_STATUS = ["antagna", "godkand", "registrerade"] as const;
export const TERMS = ["1", "2"] as const;
export type TStudentStatus = (typeof STUDENT_STATUS)[number];

/**
 * Entities
 */
export type TCourseCode = string;
export type TUserCourse = {
  type: "kurser";
  course_code: TCourseCode;
  status?: TStudentStatus;
  year?: number;
  term?: "1" | "2";
  round?: string;
  round_code?: string;
};

export type TProgramCode = string;
export type TUserProgram = {
  type: "program";
  program_code: TProgramCode;
  status?: TStudentStatus;
  year?: number;
  term?: "1" | "2";
};
