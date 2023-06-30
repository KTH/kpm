import { Request, Response, NextFunction } from "express";
import { APILang, APISetLangParams } from "kpm-backend-interface";
import { postSocial, sessionUser } from "./common";
import { handleCommonGotErrors } from "./commonErrors";
import { LANG_COOKIE_OPTS } from "../auth";
// TODO: Add API interface  and error types in kpm-backend-interface
export async function langApiHandler(
  req: Request<void, any, APISetLangParams>,
  res: Response<APILang>,
  next: NextFunction
) {
  try {
    const user = sessionUser(req.session);
    const lang = req.body.lang;
    const data = await postSocial<APILang>(user, "lang", {
      lang,
    }).catch(socialErr);

    res.cookie("language", lang, LANG_COOKIE_OPTS);
    res.send(data!);
  } catch (err) {
    next(err);
  }
}

function socialErr(err: any) {
  handleCommonGotErrors(err);
  // We don't really need any endpoint specific error handling IMHO, it's just a proxy endpoint right now.
  Error.captureStackTrace(err, socialErr);
  throw err;
}
