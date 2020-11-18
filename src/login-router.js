const log = require('skog')
const { Router } = require("express");
const { parse, validate } = require('fast-xml-parser')
const got = require('got')
// const loginRouter = Router();

module.exports = loginRouter = Router();

loginRouter.get("/", (req, res) => {
  // service URL is SERVER_HOST_URL + (path to the router) + "/callback"
  const serviceUrl = new URL(
    `${process.env.SERVER_HOST_URL}${req.baseUrl}/callback`
  );
  serviceUrl.searchParams.set("next", req.query.next);

  const loginUrl = new URL(`${process.env.SSO_ROOT_URL}/login`);
  loginUrl.searchParams.set("service", serviceUrl);

  log.info(`Redirect user to ${loginUrl}`);
  res.redirect(loginUrl);
});

loginRouter.get("/callback", async (req, res) => {
  try {
    if (!req.session.userId) {
      const serviceUrl = new URL(
        `${process.env.SERVER_HOST_URL}${req.baseUrl}/callback`
      );
      serviceUrl.searchParams.set("next", req.query.next);

      const serviceValidateUrl = new URL(
        `${process.env.SSO_ROOT_URL}/serviceValidate`
      );

      log.info(serviceUrl);

      if (req.query.ticket) {
        serviceValidateUrl.searchParams.set("ticket", req.query.ticket);
        serviceValidateUrl.searchParams.set("service", serviceUrl);

        const { body } = await got(serviceValidateUrl);
        const parsedBody = parse(body);

        if (
          validate(body) === true &&
          !parsedBody["cas:serviceResponse"]["cas:authenticationFailure"]
        ) {
          const userId = parsedBody["cas:serviceResponse"]["cas:authenticationSuccess"][
            "cas:user"
          ];
          log.info(`User ${userId} logged in`)
          req.session.userId = userId
        }
      }
    }
  } catch (err) {
    log.error(err);
  } finally {
    if (!req.query.next) {
      res.redirect("/kpm");
      return;
    }
    // Avoid loops
    if (req.query.next.endsWith("/kpm/login/callback")) {
      res.redirect("/kpm");
      return;
    }

    res.redirect(req.query.next);
  }
});
