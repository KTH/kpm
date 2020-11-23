const log = require("skog");
const { Router } = require("express");
const { parse, validate } = require("fast-xml-parser");
const got = require("got");

const loginRouter = Router();
module.exports = loginRouter;

async function authenticateUser(req) {
  // If user is already logged in, we don't do anything
  if (req.session.userId) {
    return;
  }

  if (!req.query.ticket) {
    log.error("Missing query parameter [ticket]");
    return;
  }

  const serviceValidateUrl = new URL(
    `${process.env.SSO_ROOT_URL}/serviceValidate`
  );

  serviceValidateUrl.searchParams.set("ticket", req.query.ticket);
  serviceValidateUrl.searchParams.set("service", serviceUrl);

  const { body } = await got(serviceValidateUrl);
  const parsedBody = parse(body);

  if (validate(body) === false) {
    log.error("Error when validating XML returned from login server");
    return;
  }

  if (parsedBody["cas:serviceResponse"]["cas:authenticationFailure"]) {
    log.error('XML from login server returned "Authentication failure"');
    return;
  }

  const userId =
    parsedBody["cas:serviceResponse"]["cas:authenticationSuccess"]["cas:user"];

  req.session.userId = userId;
}

loginRouter.get("/", (req, res) => {
  const serviceUrl = new URL(
    `${process.env.SERVER_HOST_URL}${req.baseUrl}/callback`
  );
  // service URL is SERVER_HOST_URL + (path to the router) + "/callback"
  serviceUrl.searchParams.set("next", req.query.next);

  const loginUrl = new URL(`${process.env.SSO_ROOT_URL}/login`);
  loginUrl.searchParams.set("service", serviceUrl);

  log.info(`Redirect user to ${loginUrl}`);
  res.redirect(loginUrl);
});

loginRouter.get("/callback", async (req, res) => {
  try {
    await authenticateUser(req);
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
