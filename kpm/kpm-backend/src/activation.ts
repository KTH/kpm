import express, { static as staticHandler } from "express";
import log from "skog";
import path from "path";
import { isValidSession } from "./auth";
import { readFileSync, writeFileSync } from "node:fs";

const IS_DEV = process.env.NODE_ENV !== "production";

export const activation = express.Router();

const PORT = parseInt(process.env.PORT || "3000");
const PROXY_HOST = process.env.PROXY_HOST || `//localhost:${PORT}`;
const PROXY_PATH_PREFIX = process.env.PROXY_PATH_PREFIX || "/kpm";
const publicUriBase = `${PROXY_HOST}${PROXY_PATH_PREFIX}`;

(function () {
  try {
    // For local development
    if (IS_DEV) {
      const path = "../kpm-frontend/distProd/activation/index.html";
      let data = readFileSync(path, "utf8");
      data = data.replaceAll(
        "https://app.kth.se/kpm/kpm.js",
        `${PROXY_HOST}/kpm/kpm.js`
      );
      writeFileSync(path, data);
      return;
    }

    // For prod and stage
    const path = "./distActivation/index.html";
    let data = readFileSync(path, "utf8");
    data = data.replaceAll("https://app.kth.se", PROXY_HOST);
    writeFileSync(path, data);
  } catch (err) {
    // NOTE: If path does not exist, this is fine for dev!
    log.info({ details: err }, "Failed to patch activation page");
  }
})();

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
