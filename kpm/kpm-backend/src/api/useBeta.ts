import { Request, Response, NextFunction } from "express";
import { sessionUser } from "./common";
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
    res.cookie("use_kpm", active ? "t" : "f", {
      domain: ".kth.se",
      httpOnly: false,
      secure: true,
      sameSite: "none",
    });
    res.send({ ok: true, active });
  } catch (err) {
    next(err);
  }
}
