import { Request, Response, NextFunction } from "express";
import { APIServices } from "kpm-backend-interface";
import { getSocial, sessionUser } from "./common";

export async function servicesApiHandler(req: Request, res: Response<APIServices>, next: NextFunction) {
  try {
    const user = sessionUser(req.session);
    const data = await getSocial<APIServices>(user, "services").catch(getSocialErrorHandler);
    res.send(data!);
  } catch (err) {
    next(err);
  }
}

function getSocialErrorHandler(err: Error) {
  // First our handled errors (these are operational errors that are expected)
  
  // And last our unhandled operational errors, we need to create a proper async
  // stacktrace for debugging
  Error.captureStackTrace(err, getSocialErrorHandler);
  throw err;
}
