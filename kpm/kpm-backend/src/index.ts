import "./config";
import express, { static as staticHandler } from "express";
import { loggingHandler, errorHandler } from "kpm-api-common";
import { api } from "./api";
import { status } from "./status";
import { auth, requiresValidSessionUser } from "./auth";
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
app.use(express.urlencoded({ extended: true }));
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
} else {
  // We are behind a proxy and need to set proper origin etc.
  // https://expressjs.com/en/guide/behind-proxies.html
  app.set('trust proxy', true);
  const corsWhitelist = ["https://www.kth.se", "https://canvas.kth.se"];
  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin || corsWhitelist.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error(`Not allowed by CORS (origin: ${origin})`));
        }
      },
    })
  );
}
app.use(`${PREFIX}`, status);
app.use(`${PREFIX}/auth`, auth);
app.use(`${PREFIX}/api`, requiresValidSessionUser, api);
app.use(`${PREFIX}/kpm.js`, widgetJsHandler);
app.use(`${PREFIX}/assets`, widgetJsAssets);

if (IS_DEV || IS_STAGE) {
  app.use(`${PREFIX}/index.:ext`, previewHandler);
}

app.use(errorHandler);

app.listen(PORT, () => {
  log.info(`Listening on port ${PORT}`);
  if (process.env.DEPLOYMENT) {
    log.info(`process.env.DEPLOYMENT = ${process.env.DEPLOYMENT}`);
  }
});
