import { Request, Response, NextFunction } from "express";
import { APIServices } from "kpm-backend-interface";
import { getSocial, sessionUser } from "./common";
import { handleCommonGotErrors } from "./commonErrors";

export async function servicesApiHandler(
  req: Request,
  res: Response<APIServices>,
  next: NextFunction
) {
  try {
    const user = sessionUser(req.session);
    const lang = req.headers["accept-language"];
    const data = await getSocial<APIServices>(user, "services", lang).catch(
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
