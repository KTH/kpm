const log = require("skog");
const { Router } = require("express");
const { compileTemplate } = require("./utils");

const cookieRouter = Router();

const toggleMenuTemplate = compileTemplate(__dirname, "toggle-menu.handlebars");

cookieRouter.post("/enabled", (_, res) => {
  log.info("kpm_use cookie enabled");
  res.send(toggleMenuTemplate({ is_active: true }));
});
cookieRouter.post("/disabled", (_, res) => {
  log.info("kpm_use cookie disabled");
  res.send(toggleMenuTemplate({ is_active: false }));
});

module.exports = cookieRouter;
