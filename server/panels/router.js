const log = require("skog");
const { Router } = require("express");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
const { compileTemplate } = require("../utils");

const panelsRouter = Router();
module.exports = panelsRouter;

const indexTemplate = compileTemplate(__dirname, "index.handlebars");
const errorPanel = compileTemplate(__dirname, "error.handlebars");
const helloPanel = compileTemplate(__dirname, "hello.handlebars");

// Returns the menu itself
panelsRouter.get("/", (req, res) => {
  console.log(req.session.userId);
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
        loginUrl: `${process.env.SERVER_HOST_URL}/kpm/login`,
        message: process.env.LOGGED_OUT_ALERT,
      })
    );
  }
});

panelsRouter.get("/hello", (req, res) => {
  corsAllow(res, req);
  if (req.session.userId) {
    res.send(
      helloPanel({
        userName: req.session.userId,
        infoUrl: `${process.env.SERVER_HOST_URL}/kpm/`,
        logoutUrl: `${process.env.SERVER_HOST_URL}/kpm/logout`,
      })
    );
  } else {
    res.send(errorPanel());
  }
});

function corsAllow(res, req) {
  res.header("Access-Control-Allow-Origin", req.headers["origin"] || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
}
