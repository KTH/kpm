import { Request, Response, NextFunction } from "express";
import { RequestError, HTTPError } from "got";
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

function getSocialErrorHandler(err: RequestError | HTTPError) {
  // First our handled errors (these are operational errors that are expected)
  if (err.name === "RequestError") {
    if (err.code === "ECONNREFUSED") {
      throw new GroupsApiEndpointError({
        type: "NotAvailable",
        statusCode: 503,
        message: "We can't connect to the Social API",
        details: null,
        err
      })
    }
  }

  if (err.name === "HTTPError") {
    if (err.code === "ERR_NON_2XX_3XX_RESPONSE") {
      throw new GroupsApiEndpointError({
        type: "BadResponse",
        statusCode: 503,
        message: "We got an error from Social API",
        details: err.message,
        err
      })
    }
  }

  if (err.name === "TimeoutError") {
    if (err.code === "TimeoutError") {
      throw new GroupsApiEndpointError({
        type: "TimeoutError",
        statusCode: 503,
        message: "The call to Social API took too long",
        details: null,
        err
      })
    }
  }
  
  // And last our unhandled operational errors, we need to create a proper async
  // stacktrace for debugging
  Error.captureStackTrace(err, getSocialErrorHandler);
  throw err;
}

