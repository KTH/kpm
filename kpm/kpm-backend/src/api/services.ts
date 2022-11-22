import { Request, Response, NextFunction } from "express";
import { EndpointError } from "kpm-api-common/src/errors";
import { APIServices, TAPIServicesEndpointError } from "kpm-backend-interface";
import { getSocial, sessionUser } from "./common";
import { handleCommonGotErrors } from "./commonErrors";

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
  handleCommonGotErrors("Social API", err, (props: any) => new ServicesApiEndpointError(props));
  
  Error.captureStackTrace(err, getSocialErrorHandler);
  throw err;
}