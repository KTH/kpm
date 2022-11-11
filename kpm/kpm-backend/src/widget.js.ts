import { Response, Request, static as staticHandler } from "express";

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

  const loggedIn = !!req.session;

  if (loggedIn) {
    res.type("text/javascript").send(`(function (js, css) {
var cr = (t) => document.createElement(t),
ap = (n) => document.head.appendChild(n);
let sc = cr('script'); sc.defer = true; sc.src = js; ap(sc);
let st = cr('link'); st.rel = "stylesheet"; st.href = css; ap(st);
let n = cr('div'); n.id = "kpm-6cf53"; n.style = "";n.innerHtml = "";document.body.prepend(n);
})("${publicUriBase}/assets/${assets["index.js"]?.fileName}", "${publicUriBase}/assets/${assets["index.css"]?.fileName}");`);
  } else {
    res.type("text/javascript").send(`(function (js, css) {
var cr = (t) => document.createElement(t);
let n = cr('div'); n.id = "kpm-6cf53"; n.style = "";
n.innerHTML = "<a href='#'>Login</a>"; document.body.prepend(n);
      })("${publicUriBase}/assets/${assets["index.js"]?.fileName}", "${publicUriBase}/assets/${assets["index.css"]?.fileName}");`);
  }

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
