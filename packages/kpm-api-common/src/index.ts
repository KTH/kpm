import { Response, Request, NextFunction } from "express";
import { v4 as uuid } from "uuid";
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
  let errId: string | undefined;

  if (err instanceof OperationalError) {
    // Operational errors are known fail states that just need to be reported to frontend.
    // These include data validation, authentication and failing calls to external APIs.
    // We only log these for stats.
    name = err.name;
    type = err.type;
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
    errId = err.errId;
    log.error(
      {
        name,
        type,
        statusCode,
        details,
        errId,
        err: err.err,
      },
      message
    );
  } else if (err instanceof RecoverableError) {
    // This is an acceptable error IN OUR CODE so we treat it more relaxed.
    // It has been caught and repackaged by a try/catch or similar.
    // A RecoverableError may contain the original error as err for logging.
    name = "RecoverableError";
    type = err.type;
    statusCode = 500;
    message = err.message;
    errId = err.errId;
    log.error({ name, type, statusCode, errId, err: err.err }, message);
  } else {
    // This is an unhandled error and should be considered a bug, we need to log the actual error
    // for debugging. Use Error.captureStackTrace for improved stacktraces in async calls.
    name = "Error";
    statusCode = 500;
    errId = uuid();
    message = `We encountered an unexpected error! (errId: ${errId})`;
    log.error({ statusCode, err, errId }, message);
    // QUESTION: Should we perform a graceful shutdown?
  }

  // Return the error to caller
  return res.status(statusCode).send({
    error: name,
    statusCode,
    type,
    message,
    errId,
  });
}
