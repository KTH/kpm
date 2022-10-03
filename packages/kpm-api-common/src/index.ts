export function loggingHandler(req: any, res: any, next: any) {
  console.log(`=> ${req.path}`); 
  next();
  res.on('finish', () => {
    console.log(`<= status: ${res.statusCode}`);
  })
}

export function errorHandler(err: any, req: any, res: any, next: any) {
  const statusCode = 500;
  const message = `${statusCode} Oops! Something went sour.`;

  console.error(err.stack)
  if (req.xhr) {
    return res.status(statusCode).send({
      status: statusCode,
      msg: message
    });
  }

  res.status(statusCode).send(`${statusCode} Oops! Something went sour.`);
}

// Give us a useful error log message
export function uncaughtExceptionCallback(err: Error) {
  console.log(`<= (connection terminated without response)`);
  throw err; // Re-throw so express terminates request
}

