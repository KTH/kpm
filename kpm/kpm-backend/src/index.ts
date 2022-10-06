import "./config";
import express from "express";
import sessionMiddleware from "express-session";
import { loggingHandler, errorHandler, uncaughtExceptionCallback } from "kpm-api-common";
import { name as APP_NAME } from "../package.json";
import { api } from "./api";
import { authRouter } from "./otherHandlers/authRouter";

const PORT = parseInt(process.env.PORT || "3000");
const PREFIX = process.env.PROXY_PATH_PREFIX || "/kpm";

export const app = express();

process.on('uncaughtException', uncaughtExceptionCallback);
app.use(loggingHandler);
app.use(PREFIX, api);

app.use(
  sessionMiddleware({
    name: "kpm.sid",
    proxy: true,
    // store: store,
    cookie: {
      domain: new URL(process.env.PROXY_HOST || "").hostname,
      maxAge: 14 * 24 * 3600 * 1000,
      httpOnly: true,
      secure: "auto",
      sameSite: "none",
    },

    // Read more: https://www.npmjs.com/package/express-session#resave
    resave: false,

    // Save only sessions when user is authenticated. Setting "saveUnitialized"
    // to "false" prevents creation of sessions when app is accessed via API
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET || "",
  })
);
app.use("/kpm/auth", authRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`${APP_NAME} listening on port ${PORT}`);
});
