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

const distProdActivationPath = "./kpm-frontend/distProd/activation";

(function () {
  try {
    // For local development
    const pathToIndexFile = path.join(
      "..",
      distProdActivationPath,
      "index.html"
    );
    if (IS_DEV) {
      let data = readFileSync(pathToIndexFile, "utf8");
      data = data.replaceAll(
        "https://app.kth.se/kpm/kpm.js",
        `${PROXY_HOST}/kpm/kpm.js`
      );
      writeFileSync(pathToIndexFile, data);
      return;
    }

    // For prod and stage
    let data = readFileSync(pathToIndexFile, "utf8");
    data = data.replaceAll("https://app.kth.se", PROXY_HOST);
    writeFileSync(pathToIndexFile, data);
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
    res.sendFile(path.join(distProdActivationPath, "index.html"), {
      root: path.join(__dirname, "..", ".."),
    });
  } else {
    const projectRoot = process.cwd();
    log.info("Serving activation page from: " + projectRoot);
    res.sendFile(path.join(distProdActivationPath, "index.html"), {
      root: projectRoot,
    });
  }
});

activation.get("/", (req, res) => {
  res.redirect(req.originalUrl.slice(0, req.originalUrl.length - 1));
});

export const widgetJsAssets = staticHandler(
  path.join("..", distProdActivationPath)
);

activation.use("/", widgetJsAssets);
