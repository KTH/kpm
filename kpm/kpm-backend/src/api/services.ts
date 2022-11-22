import { Request, Response, NextFunction } from "express";
import { EndpointError } from "kpm-api-common/src/errors";
import { APIServices, TAPIServicesEndpointError } from "kpm-backend-interface";
import { getSocial, sessionUser } from "./common";
import { handleCommonSocialErrors } from "./commonErrors";

export async function servicesApiHandler(req: Request, res: Response<APIServices>, next: NextFunction) {
  try {
    const user = sessionUser(req.session);
    const data = await getSocial<APIServices>(user, "services").catch(getSocialErrorHandler);
    res.send(data!);
  } catch (err) {
    next(err);
  }
}

class ServicesApiEndpointError extends EndpointError<TAPIServicesEndpointError> {}
function getSocialErrorHandler(err: Error) {
  // First our handled errors (these are operational errors that are expected)
  // - Handle specific errors and throw GroupsApiEndpointError

  // - Handle common social errors (but make sure we get specific error type)
  handleCommonSocialErrors(err, (props: any) => new ServicesApiEndpointError(props));
  
  // And last our unhandled operational errors, we need to create a proper async
  // stacktrace for debugging
  Error.captureStackTrace(err, getSocialErrorHandler);
  throw err;
}