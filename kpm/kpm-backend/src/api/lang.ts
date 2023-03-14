import { Request, Response, NextFunction } from "express";
import { APIGroups } from "kpm-backend-interface";
import { postSocial, sessionUser } from "./common";
import { handleCommonGotErrors } from "./commonErrors";
import { LANG_COOKIE_OPTS } from "../auth";
// TODO: Add API interface  and error types in kpm-backend-interface
export async function langApiHandler(
  req: Request,
  res: Response, // FIXME: Response type!
  next: NextFunction
) {
  try {
    const user = sessionUser(req.session);
    const lang = req.body.lang;
    const data = await postSocial(user, "lang", {
      lang,
    }).catch(socialErr);
    res.cookie("language", lang, LANG_COOKIE_OPTS);
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
