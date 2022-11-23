import { Request, Response, NextFunction } from "express";
import {
  TProgrammesEndpoint,
} from "kpm-backend-interface";
import { getSocial, sessionUser } from "./common";
import { handleCommonGotErrors } from "./commonErrors";

export async function programmesApiHandler(
  req: Request,
  res: Response<TProgrammesEndpoint>,
  next: NextFunction
) {
  try {
    const user = sessionUser(req.session);
    const data = await getSocial<TProgrammesEndpoint>(user, "programmes").catch(socialErr);
    res.send(data!);
  } catch (err) {
    next(err);
  }
}

function socialErr(err: any) {
  handleCommonGotErrors(err);
  // TODO: Add API specific error handling
  Error.captureStackTrace(err, socialErr);
  throw err;
}
