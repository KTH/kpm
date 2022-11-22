import { Response, Request, NextFunction } from "express";
import { OperationalError, RecoverableError } from "./errors";

import log from "skog";

export function loggingHandler(req: Request, res: Response, next: NextFunction) {
  log.info(`=> ${req.path}`);
  next();
  res.on("finish", () => {
    log.info(`<= status: ${res.statusCode}`);
  });
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  let statusCode: number;
  let name: "EndpointError" | "AuthError" | "RecoverableError" | undefined;
  let type: string | undefined;
  let message: string;
  let details: string | undefined;

  if (err instanceof OperationalError) {
    // Operational errors are known fail states that just need to be reported to frontend.
    // We only log these for stats.
    name = err.name;
    statusCode = err.statusCode;
    type = err.type;
    message = err.message;
    details = err.details;
    log.error({ statusCode, message });
  } else if (err instanceof RecoverableError) {
    // This is an acceptable error in our code so we treat it more relaxed.
    // It has been caught and repackaged by a try/catch or similar
    name = "RecoverableError";
    statusCode = 500;
    message = err.message;
    log.error({ statusCode: 500, message });
  } else {
    // This is an unhandled error and should be considered a bug, we need to log the actual error
    // for debugging.
    statusCode = 500
    message = `${statusCode} We encountered an unhandled error. This should be fixed or handled!`;
    log.error({ statusCode: 500, message, err });
  }

  // Return the error to caller
  if (req.xhr) {
    return res.status(statusCode).send({
      statusCode,
      name,
      type,
      message,
      details,
    });
  }

  // TODO: Wrap this fallback in KTH template
  res.status(statusCode).send(message + (details ? "\n" + details : ""));
}
