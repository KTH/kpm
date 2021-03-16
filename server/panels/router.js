const log = require("skog");
const { Router } = require("express");
const { compileTemplate } = require("../utils");
const mock = require("../../db-stub");

const panelsRouter = Router();

const indexTemplate = compileTemplate(__dirname, "index.handlebars");
const errorPanel = compileTemplate(__dirname, "error.handlebars");
const helloPanel = compileTemplate(__dirname, "hello.handlebars");
const studiesPanel = compileTemplate(__dirname, "studies.handlebars");

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

panelsRouter.get("/studies", (req, res) => {
  log.info("Requesting panel '/studies'");
  if (req.session.userId) {
    const data = mock.u1znmoik;
    for (const course of data.activeStudentCourses) {
      const canvasLinks = [];
      for (const round of course.courseRounds) {
        for (const link of round.canvas) {
          if (link.published) {
            canvasLinks.push({
              name: `${round.startTerm} ${round.startYear}-${round.roundId}`,
              url: link.url,
            });
          }
        }
      }
      course.canvasLinks = canvasLinks;
      course.pmUrl = `https://www.kth.se/kurs-pm/${course.courseCode}?l=sv`;
    }
    res.send(studiesPanel(data));
  } else {
    permissionDenied(res);
  }
});

module.exports = panelsRouter;
