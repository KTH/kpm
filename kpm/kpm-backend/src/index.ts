import "./config";
import express, { static as staticHandler } from "express";
import { loggingHandler } from "kpm-api-common";
import { api } from "./api";
import { auth } from "./auth";
import { sessionMiddleware, cookieParserMiddleware } from "./session";
import log from "skog";
import { widgetJsHandler, widgetJsAssets, previewHandler } from "./widget.js";
import cors from "cors";

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

if (IS_STAGE) {
  // We currently only need CORS in STAGE due to ref web on different domain as api
  app.use(
    cors({
      origin: "https://www-r.referens.sys.kth.se",
    })
  );
}
app.use(`${PREFIX}/auth`, auth);
app.use(`${PREFIX}/api`, api);
app.use(`${PREFIX}/kpm.js`, widgetJsHandler);
app.use(`${PREFIX}/assets`, widgetJsAssets);

if (IS_DEV || IS_STAGE) {
  app.use(`${PREFIX}/index.:ext`, previewHandler);
}

app.listen(PORT, () => {
  log.info(`Listening on port ${PORT}`);
});
