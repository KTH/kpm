import "./config";
import express, { static as staticHandler } from "express";
import { loggingHandler, errorHandler } from "kpm-api-common";
import { api } from "./api";
import { status } from "./status";
import { auth, requiresValidSessionUser } from "./auth";
import {
  sessionMiddleware,
  cookieParserMiddleware,
  sessionApiHandler,
} from "./session";
import log from "skog";
import { widgetJsHandler, widgetJsAssets, previewHandler } from "./widget.js";
import cors from "cors";
import { activation } from "./activation";

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

let corsWhitelist: string[] = [];
if (IS_STAGE) {
  corsWhitelist = [
    "https://login.ref.ug.kth.se",
    "https://www-r.referens.sys.kth.se",
    "https://kth.test.instructure.com",
  ];
} else if (!IS_DEV) {
  corsWhitelist = [
    "https://app.kth.se",
    "https://canvas.kth.se",
    "https://intra.kth.se",
    "https://login.ug.kth.se",
    "https://www.kth.se",
  ];
}
if (!IS_DEV) {
  // We are behind a proxy and need to set proper origin etc.
  // https://expressjs.com/en/guide/behind-proxies.html
  app.set("trust proxy", true);
  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin || corsWhitelist.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error(`Not allowed by CORS (origin: ${origin})`));
        }
      },
      credentials: true,
    })
  );
}

app.use(`${PREFIX}`, status);
app.use(`${PREFIX}/auth`, auth);
app.use(`${PREFIX}/api/session`, sessionApiHandler);
app.use(`${PREFIX}/api`, requiresValidSessionUser, api);
app.use(`${PREFIX}/kpm.js`, widgetJsHandler);
app.use(`${PREFIX}/assets`, widgetJsAssets);

/*if (IS_DEV || IS_STAGE) {
  app.use(`${PREFIX}/index.:ext`, previewHandler);
}*/
app.use(`${PREFIX}`, activation);

app.use(errorHandler);

app.listen(PORT, () => {
  log.info(`Listening on port ${PORT}`);
  if (process.env.DEPLOYMENT) {
    log.info(`process.env.DEPLOYMENT = ${process.env.DEPLOYMENT}`);
  }
});
