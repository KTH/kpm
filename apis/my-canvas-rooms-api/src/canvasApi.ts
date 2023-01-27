/**
 * This module contains functions to call Canvas API.
 * Functions do not contain any logic
 */
import assert from "assert";
import CanvasAPI, {
  ExtendedGenerator,
  minimalErrorHandler,
} from "@kth/canvas-api";
import { Request } from "express";
import { MutedOperationalError } from "kpm-api-common/src/errors";

export { CanvasApiError } from "@kth/canvas-api";

export interface CanvasRoom {
  id: number;
  workflow_state: "unpublished" | "available" | "completed" | "deleted";
  name: string;
  sections: CanvasSection[];
  course_code: string; // NOT a course code but a short room name
  sis_course_id?: string;
  is_favorite: boolean;
}

export interface CanvasSection {
  name: string;
}

function getToken(token = "") {
  if (token.startsWith("Bearer ")) {
    return token.substring(7);
  }

  throw new AuthTokenMissing();
}

class AuthTokenMissing extends MutedOperationalError<String> {
  constructor() {
    super({
      name: "AuthError",
      statusCode: 401,
      type: "Unauthorized",
      message:
        "You must access this endpoint either with a session or an authorization header",
      details: undefined,
    });
  }
}

export default class CanvasClient {
  client: CanvasAPI;

  constructor(req: Request<unknown>) {
    const canvasApiUrl = process.env.CANVAS_API_URL;
    assert(
      typeof canvasApiUrl === "string",
      "Missing environmental variable [CANVAS_API_URL]"
    );
    const token = getToken(req.headers.authorization);

    this.client = new CanvasAPI(canvasApiUrl, token);
    this.client.errorHandler = minimalErrorHandler;
  }

  getRooms(user: string): ExtendedGenerator<CanvasRoom> {
    return this.client.listItems<CanvasRoom>(`users/${user}/courses`, {
      include: ["sections", "favorites"],
      per_page: 96,
    });
  }

  // getSelf is NOT USED FOR NOW
  getSelf() {
    return this.client
      .get<{ id: number; login_id?: string }>("users/self")
      .then((r) => r.body);
  }
}
