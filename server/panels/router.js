const log = require("skog");
const { Router } = require("express");
const { compileTemplate } = require("../utils");

const panelsRouter = Router();

const indexTemplate = compileTemplate(__dirname, "index.handlebars");
const errorPanel = compileTemplate(__dirname, "error.handlebars");
const helloPanel = compileTemplate(__dirname, "hello.handlebars");

function permissionDenied(res) {
  log.warn("A user requested a panel without permission. Response: 403");
  res.status(403).send(
    errorPanel({
      message: "This menu cannot be requested without logging in",
    })
  );
}

// Returns the menu itself
panelsRouter.get("/", (req, res) => {
  log.info(`Requesting panel '/'. User ID: ${req.session.userId}`);
  corsAllow(res, req);
  if (req.session.userId) {
    res.send(
      indexTemplate({
        message: process.env.LOGGED_IN_ALERT,
      })
    );
  } else {
    res.send(
      indexTemplate({
        loginUrl: `${process.env.SERVER_HOST_URL}/kpm/auth/login`,
        message: process.env.LOGGED_OUT_ALERT,
      })
    );
  }
});

panelsRouter.get("/hello", (req, res) => {
  log.info("Requesting panel '/hello'");
  corsAllow(res, req);
  if (req.session.userId) {
    log.info(req.session.userData);
    res.send(
      helloPanel({
        userName: req.session.userId,
        infoUrl: `${process.env.SERVER_HOST_URL}/kpm/`,
        logoutUrl: `${process.env.SERVER_HOST_URL}/kpm/auth/logout`,
      })
    );
  } else {
    permissionDenied(res);
  }
});

function corsAllow(res, req) {
  res.header("Access-Control-Allow-Origin", req.headers["origin"] || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  //res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Vary", "Origin");
}

module.exports = panelsRouter;
