const log = require("skog");
const { Router } = require("express");
const { compileTemplate } = require("./utils");

const logRouter = Router();

const toggleMenuTemplate = compileTemplate(__dirname, "toggle-menu.handlebars");

logRouter.get("/enabled", (_, res) => {
  log.info("kpm_use cookie enabled");
  res.send(toggleMenuTemplate({ is_active: true }));
});
logRouter.get("/disabled", (_, res) => {
  log.info("kpm_use cookie disabled");
  res.send(toggleMenuTemplate({ is_active: false }));
});

module.exports = logRouter;
