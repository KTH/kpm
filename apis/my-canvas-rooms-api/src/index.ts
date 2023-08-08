import "./config";
import express from "express";
import { loggingHandler, errorHandler } from "kpm-api-common";
import log from "skog";
import { api } from "./api";
import { status } from "./publicApi";
import { AuthError } from "kpm-api-common/src/errors";
import { APIAuthErrType } from "./interface";

const PORT = parseInt(process.env.PORT || "3000");
const PREFIX = process.env.PROXY_PATH_PREFIX || "/kpm/canvas-rooms";

/**
 * In the other apps, unauthorized from another service would be a
 * configuration error, and therefore a 500 internal server error.
 * But in this app, the client is responsible for providing
 * authentication.
 */
function localErrorHandler(err: any, req: any, res: any, next: any) {
  // TODO: This should really be handled at the point where the call to Canvas is made
  // using async errorhandlers to get proper stack trace. Look at `function openIdErr(err: any)`
  // TODO: When implemented you can switch `localErrorHandler` for `errorHandler` as error
  // middleware
  if (err.code === 401) {
    err = new AuthError<APIAuthErrType>({
      type: "Unauthorized",
      message: "Client didn't provide a valid Canvas auth token",
      details: undefined, // Do we want to log the user id?
      err,
    });
  }

  errorHandler(err, req, res, next);
}

const app = express();

app.use(loggingHandler);
app.use(PREFIX, status);
app.use(PREFIX, api);
app.use(localErrorHandler);

app.listen(PORT, () => {
  log.info(`Listening on port ${PORT}`);
});
