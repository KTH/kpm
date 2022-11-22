import { Response, Request, NextFunction } from "express";
import { OperationalError, RecoverableError } from "./errors";

import log from "skog";

export function loggingHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  log.info(`=> ${req.path}`);
  next();
  res.on("finish", () => {
    log.info(`<= status: ${res.statusCode}`);
  });
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode: number;
  let name: "EndpointError" | "AuthError" | "RecoverableError" | "Error";
  let type: string | undefined;
  let message: string;
  let details: string | null | undefined;

  if (err instanceof OperationalError) {
    // Operational errors are known fail states that just need to be reported to frontend.
    // These include data validation, authentication and failing calls to external APIs.
    // We only log these for stats.
    name = err.name;
    statusCode = err.statusCode;
    type = err.type;
    message = err.message;
    details = err.details;
    log.error({ statusCode, message });
  } else if (err instanceof RecoverableError) {
    // This is an acceptable error IN OUR CODE so we treat it more relaxed.
    // It has been caught and repackaged by a try/catch or similar
    name = "RecoverableError";
    statusCode = 500;
    message = err.message;
    log.error({ statusCode: 500, message });
  } else {
    // This is an unhandled error and should be considered a bug, we need to log the actual error
    // for debugging. Use Error.captureStackTrace for improved stacktraces in async calls.
    name = "Error";
    statusCode = 500;
    message = `${statusCode} We encountered an unhandled error. This should be fixed or handled!`;
    log.error({ statusCode: 500, message, err });
  }

  // Return the error to caller
  return res.status(statusCode).send({
    error: name,
    statusCode,
    type,
    message,
    details,
  });
}
