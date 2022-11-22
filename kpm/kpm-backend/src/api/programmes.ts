import { Request, Response, NextFunction } from "express";
import { EndpointError } from "kpm-api-common/src/errors";
import {
  APIProgrammes,
  TAPIProgrammesEndpointError,
} from "kpm-backend-interface";
import { getSocial, sessionUser } from "./common";
import { handleCommonGotErrors } from "./commonErrors";

export async function programmesApiHandler(
  req: Request,
  res: Response<APIProgrammes>,
  next: NextFunction
) {
  try {
    const user = sessionUser(req.session);
    const data = await getSocial<APIProgrammes>(user, "programmes").catch(
      getSocialErrorHandler
    );
    res.send(data!);
  } catch (err) {
    next(err);
  }
}

class ProgrammesApiEndpointError extends EndpointError<TAPIProgrammesEndpointError> {}
function getSocialErrorHandler(err: Error) {
  handleCommonGotErrors(
    "Social API",
    err,
    (props: any) => new ProgrammesApiEndpointError(props)
  );

  Error.captureStackTrace(err, getSocialErrorHandler);
  throw err;
}
