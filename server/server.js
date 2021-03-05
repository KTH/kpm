const session = require("express-session");
const loginRouter = require("./login-router");
const cookieRouter = require("./cookie-router");
const panelsRouter = require("./panels/router");
const log = require("skog");
const express = require("express");
const { compileTemplate, fetchCortinaBlock, isDev } = require("./utils");
const app = express();

if (isDev) {
  log.info("App is in development mode");
}

const infoPageTemplate = compileTemplate(__dirname, "info-page.handlebars");

function corsAllow(req, res, next) {
  res.header("Access-Control-Allow-Origin", req.headers["origin"] || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  //res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Vary", "Origin");
  next();
}

app.use(corsAllow);

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

app.use("/kpm/cookie", cookieRouter);

app.get("/kpm", (req, res) => {
  const footer = fetchCortinaBlock("footer");
  const megaMenu = fetchCortinaBlock("megaMenu");
  const search = fetchCortinaBlock("search");

  res.send(
    infoPageTemplate({
      footer,
      megaMenu,
      search,
    })
  );
});

app.use(function catchAll(err, req, res, next) {
  log.error(
    {
      req,
      res,
      err,
    },
    "Unexpected error. Sending 500 to the user"
  );
  res.status(500).send("Unexpected error. Status 500");
});

module.exports = app;
