import { Request, Response, NextFunction } from "express";
import { EndpointError } from "kpm-api-common/src/errors";
import { APIProgrammes, TAPIProgrammesEndpointError } from "kpm-backend-interface";
import { getSocial, sessionUser } from "./common";
import { handleCommonSocialErrors } from "./commonErrors";

export async function programmesApiHandler(req: Request, res: Response<APIProgrammes>, next: NextFunction) {
  try {
    const user = sessionUser(req.session);
    const data = await getSocial<APIProgrammes>(user, "programmes").catch(getSocialErrorHandler);
    res.send(data!);
  } catch (err) {
    next(err);
  }
}

class ProgrammesApiEndpointError extends EndpointError<TAPIProgrammesEndpointError> {}
function getSocialErrorHandler(err: Error) {
  // First our handled errors (these are operational errors that are expected)
  // - Handle specific errors and throw GroupsApiEndpointError

  // - Handle common social errors (but make sure we get specific error type)
  handleCommonSocialErrors(err, (props: any) => new ProgrammesApiEndpointError(props));
  
  // And last our unhandled operational errors, we need to create a proper async
  // stacktrace for debugging
  Error.captureStackTrace(err, getSocialErrorHandler);
  throw err;
}
