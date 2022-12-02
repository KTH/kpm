import "./config";
import express from "express";
import { loggingHandler, errorHandler } from "kpm-api-common";
import log from "skog";
import { api } from "./api";
import { status } from "./publicApi";

const PORT = parseInt(process.env.PORT || "3000");
const PREFIX = process.env.PROXY_PATH_PREFIX || "/kpm/canvas-rooms";

/**
 * In the other apps, unauthorized from another service would be a
 * configuration error, and therefore a 500 internal server error.
 * But in this app, the client is responsible for providing
 * authentication.
 */
function localErrorHandler(err: any, req: any, res: any, next: any) {
  if (err.message.startsWith("Unauthorized.")) {
    log.info("Unauthorized.  Blaming the client");
    res.status(403).send(err.message);
  } else {
    errorHandler(err, req, res, next);
  }
}

const app = express();

app.use(loggingHandler);
app.use(PREFIX, status);
app.use(PREFIX, api);
app.use(localErrorHandler);

app.listen(PORT, () => {
  log.info(`Listening on port ${PORT}`);
});
