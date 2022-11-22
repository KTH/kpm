import { Request, Response, NextFunction } from "express";
import { APIGroups } from "kpm-backend-interface";
import { getSocial, sessionUser } from "./common";

export async function groupsApiHandler(req: Request, res: Response<APIGroups>, next: NextFunction) {
  try {
    const user = sessionUser(req.session);
    const data = await getSocial<APIGroups>(user, "groups").catch(getSocialErrorHandler);
    res.send(data!);
  } catch (err) {
    next(err);
  }
}

function getSocialErrorHandler(err: Error) {
  // Throw a proper error EndpointError
}

