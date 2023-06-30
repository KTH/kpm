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

/**
 * Entities
 */
export type TCourseCode = string;
export type TUserCourse = {
  type: string;
  course_code: TCourseCode;
  status?: "antagna" | "godkand" | "registrerade";
  year?: number;
  term?: "1" | "2";
  round?: string;
};

export type TProgramCode = string;
export type TUserProgram = {
  type: "program";
  program_code: TProgramCode;
  status?: "antagna" | "godkand" | "registrerade";
  year?: number;
  term?: "1" | "2";
};
