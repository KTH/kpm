const log = require("skog");
const { Router } = require("express");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

const blocksRouter = Router();
module.exports = blocksRouter;

function compileBlock(name) {
  return handlebars.compile(
    fs.readFileSync(path.resolve(__dirname, name), {
      encoding: "utf-8",
    })
  );
}

const indexLoggedOut = compileBlock("index-loggedout.handlebars");
const indexLoggedIn = compileBlock("index-loggedin.handlebars");

// Returns the menu itself
blocksRouter.get("/", (req, res) => {
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
