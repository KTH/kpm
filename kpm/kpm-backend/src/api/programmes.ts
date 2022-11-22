import { Request, Response, NextFunction } from "express";
import { APIProgrammes } from "kpm-backend-interface";
import { getSocial, sessionUser } from "./common";

export async function programmesApiHandler(req: Request, res: Response<APIProgrammes>, next: NextFunction) {
  try {
    const user = sessionUser(req.session);
    const data = await getSocial<APIProgrammes>(user, "programmes").catch(getSocialErrorHandler);
    res.send(data!);
  } catch (err) {
    next(err);
  }
}

function getSocialErrorHandler(err: Error) {
  // Throw a proper error EndpointError
}

