const session = require("express-session");
const cookieRouter = require("./cookie-router");
const panelsRouter = require("./panels/router");
const log = require("skog");
const express = require("express");
const { compileTemplate, fetchCortinaBlock, isDev } = require("./utils");
const openid = require("./openid");
const app = express();

if (isDev) {
  log.info("App is in development mode");
}

const infoPageTemplate = compileTemplate(__dirname, "info-page.handlebars");
const domain = new URL(process.env.SERVER_HOST_URL).hostname
  .split(".")
  .slice(-2)
  .join(".");

app.set("trust proxy", 1);
app.use(
  session({
    name: "kpm",
    secret: process.env.SESSION_SECRET,
    cookie: {
      secure: !isDev,
      httpOnly: !isDev,
      maxAge: 60 * 60 * 1000, // 1 hour
      domain,
    },
  })
);

app.use(express.json());
app.use(express.urlencoded());

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

app.use("/kpm/panels", panelsRouter);
app.use("/kpm/cookie", cookieRouter);
app.use("/kpm/auth", openid.router);
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
