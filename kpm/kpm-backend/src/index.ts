import "./config";
import express, { static as staticHandler } from "express";
import { loggingHandler } from "kpm-api-common";
import { api } from "./api";
import { auth } from "./auth";
import { sessionMiddleware, cookieParserMiddleware } from "./session";
import log from "skog";
import { widgetJsHandler, widgetJsAssets, previewHandler } from "./widget.js";

const IS_DEV = process.env.NODE_ENV !== "production";
const IS_STAGE = process.env.DEPLOYMENT === "stage";
const PORT = parseInt(process.env.PORT || "3000");
const PREFIX = process.env.PROXY_PATH_PREFIX || "/kpm";

export const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(sessionMiddleware);
app.use(cookieParserMiddleware);

app.use(loggingHandler);
app.use(`${PREFIX}/auth`, auth);
app.use(`${PREFIX}/api`, api);
app.use(`${PREFIX}/widget.js`, widgetJsHandler);
app.use(`${PREFIX}/assets`, widgetJsAssets);

if (IS_DEV || IS_STAGE) {
  app.use(`${PREFIX}/index.:ext`, previewHandler);
}

app.listen(PORT, () => {
  log.info(`Listening on port ${PORT}`);
});
