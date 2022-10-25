import log from "skog";

export function loggingHandler(req: any, res: any, next: any) {
  log.info(`=> ${req.path}`);
  next();
  res.on("finish", () => {
    log.info(`<= status: ${res.statusCode}`);
  });
}

export function errorHandler(err: any, req: any, res: any, next: any) {
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
