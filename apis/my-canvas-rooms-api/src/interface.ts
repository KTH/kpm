/**
 * General Error Types
 */
export type APIAuthErrType = "Unauthorized";

export type APIMutedAuthErrType = "MissingAuthToken";

/**
 * API Endpoint Payload Types
 *
 * Each endpoint has a payload type definition and an error type definition.
 *
 */
export type APIUserErrType = "NotFound";
export type APIUser = {
  courseRooms?: Record<string, Link[]>;
  programRooms?: Record<string, Link>;
  otherRooms?: Link[];
};

/**
 * Entities
 */

export type Link = {
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
