const session = require("express-session");
const got = require("got");
const loginRouter = require("./login-router");
const panelsRouter = require("./panels/router");

require("dotenv").config();
require("skog/bunyan").createLogger({
  app: "kpm",
  name: "kpm",
  level: "info",
  serializers: require("bunyan").stdSerializers,
});
const log = require("skog");
const express = require("express");
const { compileTemplate } = require("./utils");

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

const infoPageTemplate = compileTemplate(__dirname, "info-page.handlebars");

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

app.use("/kpm/panels", panelsRouter);
app.get("/kpm", async (req, res) => {
  try {
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
  } catch (err) {
    log.error(err);
    return res.status(400).send("");
  }
});

app.use(function catchAll(err, req, res, next) {
  log.error({
    req,
    res,
    err,
  });
  res.status(500).send("Unexpected error. Status 500");
});

module.exports = app;
