import "./config";
import express, { RequestHandler } from "express";
import { loggingHandler, errorHandler } from "kpm-api-common";
import log from "skog";
import { api as protectedApi } from "./api";
import { api as publicApi } from "./publicApi";

const PORT = parseInt(process.env.PORT || "3000");
const PREFIX = process.env.PROXY_PATH_PREFIX || "/kpm/studies";
const MY_STUDIES_API_TOKEN = process.env.MY_STUDIES_API_TOKEN!; // Required in .env.in

const authorizationMiddleware: RequestHandler = (req, res, next) => {
  if (req.headers.authorization !== MY_STUDIES_API_TOKEN) {
    // TODO: Formalize structure for error objects
    return res.status(401).send("Invalid access token" as any);
  }

  next();
};

const app = express();

app.use(loggingHandler);
app.use(PREFIX, publicApi);
app.use(PREFIX, authorizationMiddleware, protectedApi);
app.use(errorHandler);

app.listen(PORT, () => {
  log.info(`Listening on port ${PORT}`);
});
