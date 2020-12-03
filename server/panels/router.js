const log = require("skog");
const { Router } = require("express");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

const panelsRouter = Router();
module.exports = panelsRouter;

function compilePanel(name) {
  return handlebars.compile(
    fs.readFileSync(path.resolve(__dirname, name), {
      encoding: "utf-8",
    })
  );
}

const indexLoggedOut = compilePanel("index-loggedout.handlebars");
const indexLoggedIn = compilePanel("index-loggedin.handlebars");
const errorPanel = compilePanel("error.handlebars")
const helloPanel = compilePanel("hello.handlebars")

// Returns the menu itself
panelsRouter.get("/", (req, res) => {
  if (req.session.userId) {
    res.send(indexLoggedIn());
  } else {
    res.send(
      indexLoggedOut({
        loginUrl: `${process.env.SERVER_HOST_URL}/kpm/login`,
        message: process.env.LOGGED_OUT_ALERT,
      })
    );
  }
});

panelsRouter.get("/hello", (req, res) => {
  if (req.session.userId) {
    res.send(helloPanel({
      userName: req.session.userId,
      infoUrl: `${process.env.SERVER_HOST_URL}/kpm/`,
      logoutUrl: `${process.env.SERVER_HOST_URL}/kpm/logout`
    }))
  } else {
    res.send(errorPanel())
  }
})
