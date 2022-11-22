import { EndpointError } from "kpm-api-common/src/errors";

export function handleCommonSocialErrors(err: any, errFactory: (props: any) => EndpointError<string>) {
  // First our handled errors (these are operational errors that are expected)
  if (err.name === "RequestError") {
    if (err.code === "ECONNREFUSED") {
      throw errFactory({
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
      throw errFactory({
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
      throw errFactory({
        type: "TimeoutError",
        statusCode: 503,
        message: "The call to Social API took too long",
        details: null,
        err
      })
    }
  }
}