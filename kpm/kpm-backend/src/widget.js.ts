import { readFileSync } from "fs";
import path from "path";
import {
  Response,
  Request,
  static as staticHandler,
  NextFunction,
} from "express";
import { TSessionUser } from "kpm-backend-interface";
import { isValidSession, setSsoCookie, clearSsoCookie } from "./auth";

const IS_DEV = process.env.NODE_ENV !== "production";
const IS_STAGE = process.env.DEPLOYMENT === "stage";
const PREFIX = process.env.PROXY_PATH_PREFIX || "/kpm";
const PORT = parseInt(process.env.PORT || "3000");
const PROXY_HOST = process.env.PROXY_HOST || `//localhost:${PORT}`;
const PROXY_PATH_PREFIX = process.env.PROXY_PATH_PREFIX || "/kpm";
const publicUriBase = `${PROXY_HOST}${PROXY_PATH_PREFIX}`;

const distProdProductionPath = path.join(
  __dirname,
  "../../kpm-frontend/distProd/production"
);

const loggedInScriptTemplate = readFileSync(
  path.join(__dirname, "./widget.js/loggedIn.js"),
  {
    encoding: "utf-8",
  }
);
const notLoggedInScriptTemplate = readFileSync(
  path.join(__dirname, "./widget.js/notLoggedIn.js"),
  { encoding: "utf-8" }
);
/**
 * Responds with the initial javascript file that holds the entire personal menu
 */
export async function widgetJsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Check "login_success = false" to avoid infinite loops
    if (req.params.login_success === "false") {
      clearSsoCookie(res);
      res.send("personal menu for logged out users");
      return;
    }

    // TODO: Check if the login server has been pinged within the last 15 minutes
    // If not, redirect to /auth/login_check with widget.js url as nextUrl
    // kpm session should be cleared by the callback if login server session
    // has expired.
    // QUESTION: Should we sen kpmLoaded with { isLoggedIn: false } if not logged in?

    const assets = getLatestDistFileNames();

    const loggedIn = isValidSession(req.session.user);
    const LOGIN_URL = `${publicUriBase}/auth/login`;
    const lang = req.cookies["language"];

    if (loggedIn) {
      // *** LOGGED IN ***
      const userToFrontend: TSessionUser = req.session.user!;
      setSsoCookie(res);
      const content = loggedInScriptTemplate
        .replace(
          "{{JS_ASSET}}",
          `${publicUriBase}/assets/${assets["index.js"]?.fileName}`
        )
        .replace(
          "{{CSS_ASSET}}",
          `${publicUriBase}/assets/${assets["index.css"]?.fileName}`
        )
        .replace("{{KPM_PUBLIC_URI_BASE}}", publicUriBase)
        .replace("{{KPM_CURRENT_USER}}", JSON.stringify(userToFrontend))
        .replace("{{KPM_SETTINGS}}", JSON.stringify({ lang }));

      res.type("text/javascript").send(content);
    } else {
      // *** NOT LOGGED IN ***
      // index.css contains Canvas CSS-fixes so we are passing it.
      clearSsoCookie(res);
      const content = notLoggedInScriptTemplate
        .replace(
          "{{JS_ASSET}}",
          `${publicUriBase}/assets/${assets["index.js"]?.fileName}`
        )
        .replace(
          "{{CSS_ASSET}}",
          `${publicUriBase}/assets/${assets["index.css"]?.fileName}`
        )
        .replace("{{LOGIN_URL}}", LOGIN_URL);
      res.type("text/javascript").send(content);
    }
    // TODO: What is this used for?:
    // Need to check
    // res.redirect("/check");
  } catch (e) {
    next(e);
  }
}

let latestDistFileNames: Record<string, { fileName?: string }> | null = null;
function getLatestDistFileNames() {
  if (latestDistFileNames) return latestDistFileNames;
  latestDistFileNames = getLatestDistFileNamesFromDisk();
  return latestDistFileNames;
}

function getLatestDistFileNamesFromDisk() {
  const manifestJson = readFileSync(
    path.join(distProdProductionPath, "manifest.json")
  );
  return JSON.parse(manifestJson.toString()) as Record<
    string,
    { fileName?: string }
  >;
}

// Mount paths appear to be relative to project root
export const widgetJsAssets = staticHandler(distProdProductionPath, {
  immutable: true,
  index: false,
  maxAge: "180 days",
});
