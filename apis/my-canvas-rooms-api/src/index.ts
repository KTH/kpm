import "./config";
import express from "express";
import { loggingHandler, errorHandler } from "kpm-api-common";
import log from "skog";
import { api } from "./api";

const PORT = parseInt(process.env.PORT || "3000");
const PREFIX = process.env.PROXY_PATH_PREFIX || "/kpm/canvas-rooms";

const app = express();

app.use(loggingHandler);
app.use(PREFIX, api);
app.use(errorHandler);

app.listen(PORT, () => {
  log.info(`Listening on port ${PORT}`);
});
