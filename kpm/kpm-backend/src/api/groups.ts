import { Request, Response, NextFunction } from "express";
import { RequestError } from "got";
import { EndpointError } from "kpm-api-common/src/errors";
import { APIGroups, TAPIGroupsEndpointError } from "kpm-backend-interface";
import { getSocial, sessionUser } from "./common";


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

function getSocialErrorHandler(err: RequestError) {
  // First our handled errors (these are operational errors that are expected)
  if (err.code === "ECONNREFUSED") {
    throw new GroupsApiEndpointError({
      type: "NotAvailable",
      statusCode: 503,
      message: "We can't connect to the Social API",
      details: null,
      err
    })
  }
  
  // And last our unhandled operational errors, we need to create a proper async
  // stacktrace for debugging
  Error.captureStackTrace(err, getSocialErrorHandler);
  throw err;
}

