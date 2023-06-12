import { readFileSync } from "fs";
import path from "path";
import { Response, Request, static as staticHandler } from "express";
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

/**
 * Responds with the initial javascript file that holds the entire personal menu
 */
export async function widgetJsHandler(req: Request, res: Response) {
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
    res.type("text/javascript").send(`(function (js, css) {
document.body.style.setProperty("--kpm-bar-height", "calc(2em + 1px)");
var cr = (t) => document.createElement(t),
ap = (n) => document.head.appendChild(n);
let sc = cr('script'); sc.defer = true; sc.src = js; ap(sc);
let st = cr('link'); st.rel = "stylesheet"; st.href = css; ap(st);
let n = cr('div'); n.id = "kpm-6cf53";
n.style.position="fixed";
document.body.classList.add('use-personal-menu');
document.body.prepend(n);
window.__kpmPublicUriBase__ = "${
      publicUriBase
      // NOTE: This global variable is read in kpm-backend/src/panes/utils.ts
    }";
window.__kpmCurrentUser__ = ${
      // Inject some user data to allow rendering the menu properly.
      JSON.stringify(userToFrontend)
    };
window.__kpmSettings__ = ${JSON.stringify({ lang })};
})("${publicUriBase}/assets/${
      assets["index.js"]?.fileName
    }", "${publicUriBase}/assets/${assets["index.css"]?.fileName}");`);
  } else {
    // *** NOT LOGGED IN ***
    // index.css contains Canvas CSS-fixes so we are passing it.
    clearSsoCookie(res);
    res.type("text/javascript").send(`(function (js, css) {
document.body.style.setProperty("--kpm-bar-height", "calc(2em + 1px)");
var cr = (t) => document.createElement(t),
ap = (e) => document.head.appendChild(e);
let st = cr('link'); st.rel = "stylesheet"; st.href = css; ap(st);
let n = cr('div'); n.id = "kpm-6cf53";
let s = n.style;s.pointerEvents="all";s.inset="0";s.position="fixed";s.display="flex";s.alignItems="center";s.height="calc(2em + 1px)";s.padding="0 1rem";s.justifyContent="center";s.margin="0 auto";s.backgroundColor="#65656c";
let nd = cr('div');
s = nd.style;s.width="100%";s.maxWidth="1228px";s.display="flex";s.alignItems="center";
let nda = cr('a');
nda.append("Login");
nda.href = '${LOGIN_URL}?nextUrl=' + location.href;
s = nda.style;s.marginLeft="auto";s.color="white";
nd.append(nda);n.append(nd)
document.body.classList.add('use-personal-menu');
document.body.prepend(n);
})("${publicUriBase}/assets/${
      assets["index.js"]?.fileName
    }", "${publicUriBase}/assets/${assets["index.css"]?.fileName}");
window.__kpmSettings__ = ${JSON.stringify({ lang })};`);
  }
  // TODO: What is this used for?:
  // Need to check
  // res.redirect("/check");
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

export function previewHandler(req: Request, res: Response) {
  const { ext } = req.params;
  res.sendFile(`index.${ext}`, { root: __dirname });
}
