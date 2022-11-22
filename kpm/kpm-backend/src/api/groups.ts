import { Request, Response, NextFunction } from "express";
import { RequestError, HTTPError, TimeoutError } from "got";
import { EndpointError } from "kpm-api-common/src/errors";
import { APIGroups, TAPIGroupsEndpointError } from "kpm-backend-interface";
import { getSocial, sessionUser } from "./common";
import { handleCommonSocialErrors } from "./commonErrors";


export async function groupsApiHandler(req: Request, res: Response<APIGroups>, next: NextFunction) {
  try {
    const user = sessionUser(req.session);
    const data = await getSocial<APIGroups>(user, "groups").catch(getSocialErrorHandler);
    res.send(data!);
  } catch (err) {
    next(err);
  }
}

class GroupsApiEndpointError extends EndpointError<TAPIGroupsEndpointError> {}
function getSocialErrorHandler(err: any) {
  // First our handled errors (these are operational errors that are expected)
  // - Handle specific errors and throw GroupsApiEndpointError

  // - Handle common social errors (but make sure we get specific error type)
  handleCommonSocialErrors(err, (props: any) => new GroupsApiEndpointError(props));
  
  // And last our unhandled operational errors, we need to create a proper async
  // stacktrace for debugging
  Error.captureStackTrace(err, getSocialErrorHandler);
  throw err;
}

