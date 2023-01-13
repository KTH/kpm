import express, { static as staticHandler } from "express";
import log from "skog";
import path from "path";
import { isValidSession } from "./auth";

const IS_DEV = process.env.NODE_ENV !== "production";

export const activation = express.Router();

const PORT = parseInt(process.env.PORT || "3000");
const PROXY_HOST = process.env.PROXY_HOST || `//localhost:${PORT}`;
const PROXY_PATH_PREFIX = process.env.PROXY_PATH_PREFIX || "/kpm";
const publicUriBase = `${PROXY_HOST}${PROXY_PATH_PREFIX}`;

activation.get("", (req, res) => {
  // Check "login_success = false" to avoid infinite loops
  if (!isValidSession(req.session.user)) {
    const LOGIN_URL = `${publicUriBase}/auth/login?nextUrl=${publicUriBase}/`;
    return res.redirect(LOGIN_URL);
  }

  if (IS_DEV) {
    res.sendFile("./kpm-frontend/distProd/activation/index.html", {
      root: path.join(__dirname, "..", ".."),
    });
  } else {
    const projectRoot = process.cwd();
    log.info("Serving activation page from: " + projectRoot);
    res.sendFile("./distActivation/index.html", {
      root: projectRoot,
    });
  }
});

activation.get("/", (req, res) => {
  res.redirect(req.originalUrl.slice(0, req.originalUrl.length - 1));
});

export const widgetJsAssets = IS_DEV
  ? staticHandler("../kpm-frontend/distProd/activation")
  : staticHandler("./distActivation");

activation.use("/", widgetJsAssets);
