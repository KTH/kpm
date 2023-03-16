import { Response, Request, static as staticHandler } from "express";
import { TSessionUser } from "kpm-backend-interface";
import { isValidSession } from "./auth";

const IS_DEV = process.env.NODE_ENV !== "production";
const IS_STAGE = process.env.DEPLOYMENT === "stage";
const PORT = parseInt(process.env.PORT || "3000");
const PROXY_HOST = process.env.PROXY_HOST || `//localhost:${PORT}`;
const PROXY_PATH_PREFIX = process.env.PROXY_PATH_PREFIX || "/kpm";
const publicUriBase = `${PROXY_HOST}${PROXY_PATH_PREFIX}`;

/**
 * Responds with the initial javascript file that holds the entire personal menu
 */
export async function widgetJsHandler(req: Request, res: Response) {
  // Check "login_success = false" to avoid infinite loops
  if (req.params.login_success === "false") {
    res.send("personal menu for logged out users");
    return;
  }

  const assets = getLatestDistFileNames();

  const loggedIn = isValidSession(req.session.user);
  const LOGIN_URL = `${publicUriBase}/auth/login`;
  const lang = req.cookies["language"];

  if (loggedIn) {
    // *** LOGGED IN ***
    const userToFrontend: TSessionUser = req.session.user!;
    res.type("text/javascript").send(`(function (js, css) {
var cr = (t) => document.createElement(t),
ap = (n) => document.head.appendChild(n);
let sc = cr('script'); sc.defer = true; sc.src = js; ap(sc);
let st = cr('link'); st.rel = "stylesheet"; st.href = css; ap(st);
let n = cr('div'); n.id = "kpm-6cf53";
n.style.minHeight="calc(var(--kpm-bar-height,2em) + 1px)";n.style.backgroundColor="#65656c";
document.body.prepend(n);
window.__kpmPublicUriBase__ = "${
      publicUriBase
      // NOTE: This global variable is read in kpm-backend/src/panes/utils.ts
    }";
window.__kpmCurrentUser__ = ${
      // Inject some user data to allow rendering the menu properly
      JSON.stringify(userToFrontend)
    };
window.__kpmSettings__ = ${JSON.stringify({ lang })};
})("${publicUriBase}/assets/${
      assets["index.js"]?.fileName
    }", "${publicUriBase}/assets/${assets["index.css"]?.fileName}");`);
  } else {
    // *** NOT LOGGED IN ***
    // index.css contains Canvas CSS-fixes so we are passing it.
    res.type("text/javascript").send(`(function (js, css) {
var cr = (t) => document.createElement(t),
ap = (e) => document.head.appendChild(e);
let st = cr('link'); st.rel = "stylesheet"; st.href = css; ap(st);
let n = cr('div'); n.id = "kpm-6cf53";
let s = n.style;s.pointerEvents="all";s.inset="0";s.position="sticky";s.display="flex";s.alignItems="center";s.height="calc(var(--kpm-bar-height,2em) + 1px)";s.padding="0 1rem";s.justifyContent="center";s.margin="0 auto";s.backgroundColor="#65656c";
let nd = cr('div');
s = nd.style;s.width="100%";s.maxWidth="1228px";s.display="flex";s.alignItems="center";
let nda = cr('a');
nda.append("Login");
nda.href = '${LOGIN_URL}?nextUrl=' + location.href;
s = nda.style;s.marginLeft="auto";s.color="white";
nd.append(nda);n.append(nd)
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

function getLatestDistFileNames() {
  return {
    "index.js": {
      fileName: "index.js",
    },
    "index.css": {
      fileName: "index.css",
    },
  };
}

// Mount paths appear to be relative to project root
export const widgetJsAssets = IS_DEV
  ? staticHandler("../kpm-frontend/distProd/production")
  : staticHandler("./distProd");

export function previewHandler(req: Request, res: Response) {
  const { ext } = req.params;
  res.sendFile(`index.${ext}`, { root: __dirname });
}
