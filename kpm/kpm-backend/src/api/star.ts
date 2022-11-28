import { Request, Response, NextFunction } from "express";
import { APIGroups } from "kpm-backend-interface";
import { postSocial, sessionUser } from "./common";
import { handleCommonGotErrors } from "./commonErrors";

// TODO: Add API interface  and error types in kpm-backend-interface
export async function starApiHandler(
  req: Request,
  res: Response, // FIXME: Response type!
  next: NextFunction
) {
  try {
    const user = sessionUser(req.session);
    const data = await postSocial(user, "star", {
      kind: req.body.kind,
      slug: req.body.slug,
      starred: req.body.starred,
    }).catch(socialErr);
    res.send(data);
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
