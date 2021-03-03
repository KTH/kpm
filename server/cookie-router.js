const log = require("skog");
const { Router } = require("express");
const { compileTemplate, isDev } = require("./utils");

const COOKIE_NAME = "use_kpm";

const cookieRouter = Router();

const options = {
  secure: !isDev,
  httpOnly: false,
  maxAge: 360000,
  domain: ".kth.se",
};

const toggleMenuTemplate = compileTemplate(__dirname, "toggle-menu.handlebars");

cookieRouter.post("/enabled", (_, res) => {
  log.info("kpm_use cookie enabled");
  res.cookie(COOKIE_NAME, "true", options);
  res.send(toggleMenuTemplate({ is_active: true }));
});
cookieRouter.post("/disabled", (_, res) => {
  log.info("kpm_use cookie disabled");
  res.clearCookie(COOKIE_NAME, {
    expires: new Date(0),
    ...options,
  });
  res.send(toggleMenuTemplate({ is_active: false }));
});

module.exports = cookieRouter;
