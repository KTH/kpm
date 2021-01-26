const session = require("express-session");
const loginRouter = require("./login-router");
const panelsRouter = require("./panels/router");
const log = require("skog");
const express = require("express");
const { compileTemplate, fetchCortinaBlock } = require("./utils");
const app = express();

const isDev = process.env.NODE_ENV !== "production";
if (isDev) {
  log.info("App is in development mode");
}

const infoPageTemplate = compileTemplate(__dirname, "info-page.handlebars");

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
  const footer = await fetchCortinaBlock("footer");
  const megaMenu = await fetchCortinaBlock("megaMenu");
  const search = await fetchCortinaBlock("search");

  res.send(
    infoPageTemplate({
      footer,
      megaMenu,
      search,
    })
  );
});

module.exports = app;
