import { Request, Response, NextFunction } from "express";
import { EndpointError } from "kpm-api-common/src/errors";
import { APIGroups, TAPIGroupsEndpointError } from "kpm-backend-interface";
import { getSocial, sessionUser } from "./common";
import { handleCommonGotErrors } from "./commonErrors";

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
  handleCommonGotErrors("Social API", err, (props: any) => new GroupsApiEndpointError(props));
  
  Error.captureStackTrace(err, getSocialErrorHandler);
  throw err;
}
