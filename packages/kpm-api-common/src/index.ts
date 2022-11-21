import { Response, Request, NextFunction, Errback } from "express";
import log from "skog";

export function loggingHandler(req: Request, res: Response, next: NextFunction) {
  log.info(`=> ${req.path}`);
  next();
  res.on("finish", () => {
    log.info(`<= status: ${res.statusCode}`);
  });
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  const statusCode = 500;
  const message = `${statusCode} Oops! Something went sour.`;

  log.error(err);

  if (req.xhr) {
    return res.status(statusCode).send({
      status: statusCode,
      msg: message,
    });
  }

  res.status(statusCode).send(message);
}
