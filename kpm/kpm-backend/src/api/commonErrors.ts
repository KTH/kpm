import { EndpointError } from "kpm-api-common/src/errors";

export function handleCommonGotErrors(
  name: string,
  err: any,
  errFactory: (props: any) => EndpointError<string>
) {
  // First our handled errors (these are operational errors that are expected)
  if (err.name === "RequestError") {
    if (err.code === "ECONNREFUSED") {
      Error.captureStackTrace(err, handleCommonGotErrors);
      throw errFactory({
        type: "NotAvailable",
        statusCode: 503,
        message: `We can't connect to the ${name}`,
        details: null,
        err,
      });
    }
  }

  if (err.name === "HTTPError") {
    if (err.code === "ERR_NON_2XX_3XX_RESPONSE") {
      Error.captureStackTrace(err, handleCommonGotErrors);
      throw errFactory({
        type: "BadResponse",
        statusCode: 503,
        message: `We got an error from ${name}`,
        details: err.message,
        err,
      });
    }
  }

  if (err.name === "TimeoutError") {
    if (err.code === "TimeoutError") {
      Error.captureStackTrace(err, handleCommonGotErrors);
      throw errFactory({
        type: "TimeoutError",
        statusCode: 503,
        message: `The call to ${name} took too long`,
        details: null,
        err,
      });
    }
  }
}
