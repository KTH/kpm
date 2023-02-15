export type Link = {
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

export type APIUserErrType = "NotFound";
export type APIUser = {
  rooms: Record<string, Link[]>;
};

export type APIMutedAuthErrType = "MissingAuthToken";
