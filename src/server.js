const handlebars = require("handlebars");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const session = require("express-session");
const got = require("got");

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
const authenticationMiddleware = require("./middleware/authenticationMiddleware.js");
const app = express();

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

const template = compileTemplate("index.handlebars");
const loggedInTemplate = compileTemplate("kpm-loggedin.js.handlebars");
const loggedOutTemplate = compileTemplate("kpm-loggedout.js.handlebars");

// TODO: Sass?
const menuCssData = fs.readFileSync(path.resolve(__dirname, "menu.css"));
const menuCssName = `menu-${hash(menuCssData)}.css`;

function hash(data) {
  const hash = crypto.createHash("md5");
  hash.update(data);
  return hash.digest("base64").slice(0, 12);
}

async function fetchBlock(str) {
  const res = await got.get(`https://www.kth.se/cm/${blocks[str]}`);
  return res.body;
}

app.set("trust proxy", 1);

var expires = new Date(Date.now() + 60 * 60 * 1000); // TODO: is 1h fine?

// TODO: how shall we decide on naming this?
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    name: "kpm",
  })
);

app.use("/kpm/dist", express.static("dist"));

app.use(authenticationMiddleware);

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

app.get(`/kpm/${menuCssName}`, (req, res) => {
  res.setHeader("Content-Type", "text/css");
  res.setHeader("Expires", addDays(new Date(), 180).toUTCString());
  res.send(menuCssData);
});

app.get("/kpm/kpm.js", async (req, res) => {
  const baseUrl = `${process.env.SERVER_HOST_URL}/kpm`;
  const cssUrl = `${baseUrl}/${menuCssName}`;

  const loginUrl = new URL(`${process.env.SSO_ROOT_URL}/login`);

  loginUrl.searchParams.set("service", baseUrl);

  res.setHeader("Content-type", "application/javascript");

  if (req.session.userId) {
    res.send(
      loggedInTemplate({
        baseUrl,
        cssUrl,
        userName: req.session.userId,
        loginUrl,
      })
    );
  } else {
    res.send(
      loggedOutTemplate({
        baseUrl,
        cssUrl,
        loginUrl,
      })
    );
  }
});

app.get("/kpm/logout", (req, res) => {
  req.session = null;
  const logoutUrl = new URL(`${process.env.SSO_ROOT_URL}/logout`);
  res.redirect(logoutUrl);
});

app.get("/kpm", async (req, res) => {
  const footer = await fetchBlock("footer");
  const megaMenu = await fetchBlock("megaMenu");
  const search = await fetchBlock("search");

  res.send(
    template({
      footer,
      megaMenu,
      search,
    })
  );
});

module.exports = app;
