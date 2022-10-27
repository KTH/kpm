import "./config";
import express from "express";
import { loggingHandler } from "kpm-api-common";
import { api } from "./api";
import { auth } from "./auth";
import { sessionMiddleware } from "./session";
import log from "skog";
import widgetJsHandler from "./widget.js";

const PORT = parseInt(process.env.PORT || "3000");
const PREFIX = process.env.PROXY_PATH_PREFIX || "/kpm";

export const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(sessionMiddleware);
app.use(loggingHandler);
app.use(`${PREFIX}/auth`, auth);
app.use(`${PREFIX}/api`, api);
app.use(`${PREFIX}/widget.js`, widgetJsHandler);

app.listen(PORT, () => {
  log.info(`Listening on port ${PORT}`);
});
