/**
 * API Endpoint Payload Types
 *
 * Each endpoint has a payload type definition and an error type definition.
 */
export type APIUserTeaching = { [index: TCourseCode]: Role[] } | null;
export type APIUserTeachingErrType = ""; // TODO: Proper error handling not implemented yet

/**
 * Entities
 */
export type TCourseCode = string;
export type Role = {
  role: string;
  year: string;
  term: string;
  round_id: string;
};
