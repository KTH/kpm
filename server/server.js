const handlebars = require("handlebars");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const session = require("express-session");
const got = require("got");
const loginRouter = require("./login-router");
const blocksRouter = require("./blocks/router");
const { addDays } = require("date-fns");

require("dotenv").config();
require("skog/bunyan").createLogger({
  app: "kpm",
  name: "kpm",
  level: "info",
  serializers: require("bunyan").stdSerializers,
});
const log = require("skog");
const express = require("express");
const app = express();

const isDev = process.env.NODE_ENV !== "production";
if (isDev) {
  log.info("App is in development mode");
}

const blocks = {
  title: "1.260060",
  megaMenu: "1.855134",
  secondaryMenu: "1.865038",
  image: "1.77257",
  footer: "1.202278",
  search: "1.77262",
  language: {
    en: "1.77273",
    sv: "1.272446",
  },
  analytics: "1.464751",
  gtmAnalytics: "1.714097",
  gtmNoscript: "1.714099",
};

function compileTemplate(name) {
  return handlebars.compile(
    fs.readFileSync(path.resolve(__dirname, name), {
      encoding: "utf-8",
    })
  );
}

const infoPageTemplate = compileTemplate("info-page.handlebars");
const loggedInTemplate = compileTemplate(
  "../client/kpm-loggedin.js.handlebars"
);
const loggedOutTemplate = compileTemplate(
  "../client/kpm-loggedout.js.handlebars"
);

// TODO: Sass?
const menuCssData = fs.readFileSync(
  path.resolve(__dirname, "../client/menu.css")
);
const menuCssName = `menu-${hash(menuCssData)}.css`;

function hash(data) {
  const hash = crypto.createHash("md5");
  hash.update(data);
  return hash.digest("hex").slice(0, 12);
}

async function fetchBlock(str) {
  const res = await got.get(`https://www.kth.se/cm/${blocks[str]}`);
  return res.body;
}

app.set("trust proxy", 1);

app.use(
  session({
    name: "kpm",
    secret: process.env.SESSION_SECRET,
    cookie: {
      secure: !isDev,
      httpOnly: !isDev,
      maxAge: 60 * 60 * 1000, // 1 hour
      domain: "kth.se",
    },
  })
);

app.use("/kpm", express.static("dist"));
app.get("/kpm/_monitor", (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  let version = "unknown";
  try {
    const info = require("../buildinfo.js");
    version = `${info.dockerName}-${info.dockerVersion} (${info.gitBranch})`;
  } catch (err) {
    log.warn(`Failed to get app version: ${err}`);
  }
  res.send(`APPLICATION_STATUS: OK ${version}`);
});
app.use("/kpm/login", loginRouter);
app.get("/kpm/logout", (req, res) => {
  req.session.destroy();
  const logoutUrl = new URL(`${process.env.SSO_ROOT_URL}/logout`);
  res.redirect(logoutUrl);
});

app.use("/kpm/blocks", blocksRouter);
app.get("/kpm", async (req, res) => {
  const footer = await fetchBlock("footer");
  const megaMenu = await fetchBlock("megaMenu");
  const search = await fetchBlock("search");

  res.send(
    infoPageTemplate({
      footer,
      megaMenu,
      search,
    })
  );
});

module.exports = app;
