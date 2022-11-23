import { Request, Response, NextFunction } from "express";
import { TServicesEndpoint } from "kpm-backend-interface";
import { getSocial, sessionUser } from "./common";
import { handleCommonGotErrors } from "./commonErrors";

export async function servicesApiHandler(
  req: Request,
  res: Response<TServicesEndpoint>,
  next: NextFunction
) {
  try {
    const user = sessionUser(req.session);
    const data = await getSocial<TServicesEndpoint>(user, "services").catch(
      socialErr
    );
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
