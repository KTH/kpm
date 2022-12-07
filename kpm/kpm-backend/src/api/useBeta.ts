import { Request, Response, NextFunction } from "express";
import { APIGroups } from "kpm-backend-interface";
import { postSocial, sessionUser } from "./common";
import { handleCommonGotErrors } from "./commonErrors";
import log from "skog";

// TODO: Add API interface  and error types in kpm-backend-interface
export async function useBeta(
  req: Request,
  res: Response, // FIXME: Response type!
  next: NextFunction
) {
  try {
    const user = sessionUser(req.session);
    const { active } = req.body;
    log.warn(
      { user, active },
      active ? "User activated kpm beta" : "User deactivated kpm beta"
    );
    if (active) {
      res.cookie("use_kpm", "t", {
        domain: ".kth.se",
        httpOnly: false,
        secure: true,
        sameSite: "none",
      });
    } else {
      res.clearCookie("use_kpm");
    }
    res.send({ ok: true, active });
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
