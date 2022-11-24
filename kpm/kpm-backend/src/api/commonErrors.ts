import { RequestError, HTTPError, TimeoutError } from "got";
import { EndpointError } from "kpm-api-common/src/errors";
import { TGotErrType } from "kpm-backend-interface";

export function handleCommonGotErrors(
  err: RequestError | HTTPError | TimeoutError
) {
  // First our handled errors (these are operational errors that are expected)
  if (err.name === "RequestError") {
    if (err.code === "ECONNREFUSED") {
      Error.captureStackTrace(err, handleCommonGotErrors);
      throw new EndpointError<TGotErrType>({
        type: "NotAvailable",
        statusCode: 424,
        message: "We can't connect to an external API",
        details: {
          requestUrl: err?.request?.requestUrl,
          message: err.message,
        },
        err,
      });
    }
  }

  if (err.name === "HTTPError") {
    if (err.code === "ERR_NON_2XX_3XX_RESPONSE") {
      Error.captureStackTrace(err, handleCommonGotErrors);
      throw new EndpointError<TGotErrType>({
        type: "BadResponse",
        statusCode: 424,
        message: "We can't connect to an external API",
        details: {
          requestUrl: err?.request?.requestUrl,
          message: err.message,
        },
        err,
      });
    }
  }

  if (err.name === "TimeoutError") {
    if (err.code === "TimeoutError") {
      Error.captureStackTrace(err, handleCommonGotErrors);
      throw new EndpointError<TGotErrType>({
        type: "TimeoutError",
        statusCode: 424,
        message: "We can't connect to an external API",
        details: {
          requestUrl: err?.request?.requestUrl,
          message: err.message,
        },
        err,
      });
    }
  }
}
