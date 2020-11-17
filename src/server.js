const handlebars = require("handlebars");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const session = require("express-session");
const got = require("got");
const { validate, parse } = require("fast-xml-parser");
const { addDays } = require("date-fns");

require("dotenv").config();
require("skog/bunyan").createLogger({
  app: "kpm",
  name: "kpm",
  level: "info",
  serializers: require("bunyan").stdSerializers,
});
const log = require("skog");
const express = require("express");
const app = express();

const isDev = process.env.NODE_ENV !== "production";

const blocks = {
  title: "1.260060",
  megaMenu: "1.855134",
  secondaryMenu: "1.865038",
  image: "1.77257",
  footer: "1.202278",
  search: "1.77262",
  language: {
    en: "1.77273",
    sv: "1.272446",
  },
  analytics: "1.464751",
  gtmAnalytics: "1.714097",
  gtmNoscript: "1.714099",
};

function compileTemplate(name) {
  return handlebars.compile(
    fs.readFileSync(path.resolve(__dirname, name), {
      encoding: "utf-8",
    })
  );
}

const template = compileTemplate("index.handlebars");
const loggedInTemplate = compileTemplate("kpm-loggedin.js.handlebars");
const loggedOutTemplate = compileTemplate("kpm-loggedout.js.handlebars");

// TODO: Sass?
const menuCssData = fs.readFileSync(path.resolve(__dirname, "menu.css"));
const menuCssName = `menu-${hash(menuCssData)}.css`;

function hash(data) {
  const hash = crypto.createHash("md5");
  hash.update(data);
  return hash.digest("base64").slice(0, 12);
}

async function fetchBlock(str) {
  const res = await got.get(`https://www.kth.se/cm/${blocks[str]}`);
  return res.body;
}

app.set("trust proxy", 1);

var expires = new Date(Date.now() + 60 * 60 * 1000); // TODO: is 1h fine?

// TODO: how shall we decide on naming this?
app.use(
  session({
    name: "kpm",
    secret: process.env.SESSION_SECRET,
    cookie: {
      secure: !isDev,
      httpOnly: !isDev,
      expires,
      domain: "kth.se",
    },
  })
);

app.use("/kpm/dist", express.static("dist"));

app.get("/kpm/_monitor", (req, res) => {
  res.setHeader("Content-Type", "text/plain");
  let version = "unknown";
  try {
    const info = require("../buildinfo.js");
    version = `${info.dockerName}-${info.dockerVersion} (${info.gitBranch})`;
  } catch (err) {
    log.warn(`Failed to get app version: ${err}`);
  }
  res.send(`APPLICATION_STATUS: OK ${version}`);
});

app.get(`/kpm/${menuCssName}`, (req, res) => {
  res.setHeader("Content-Type", "text/css");
  res.setHeader("Expires", addDays(new Date(), 180).toUTCString());
  res.send(menuCssData);
});

app.get("/kpm/kpm.js", async (req, res) => {
  const baseUrl = `${process.env.SERVER_HOST_URL}/kpm`;
  const cssUrl = `${baseUrl}/${menuCssName}`;

  res.setHeader("Content-type", "application/javascript");

  if (req.session.userId) {
    res.send(
      loggedInTemplate({
        baseUrl,
        cssUrl,
        userName: req.session.userId,
        loginUrl: baseUrl,
      })
    );
  } else {
    res.send(
      loggedOutTemplate({
        cssUrl,
        loginUrl: `${baseUrl}/login`,
      })
    );
  }
});

// Redirect the user to the KTH login server
app.get("/kpm/login", (req, res) => {
  const serviceUrl = new URL(
    `${process.env.SERVER_HOST_URL}/kpm/login/callback`
  );
  serviceUrl.searchParams.set("next", req.query.next);

  const loginUrl = new URL(`${process.env.SSO_ROOT_URL}/login`);
  loginUrl.searchParams.set("service", serviceUrl);

  log.info(`Redirect user to ${loginUrl}`);
  res.redirect(loginUrl);
});

// User is redirected from KTH login server to this endpoint.
// Query parameters: ticket, next
//
// Sets the session cookie and then redirect the user to "next"
app.get("/kpm/login/callback", async (req, res) => {
  try {
    if (!req.session.userId) {
      const serviceUrl = new URL(
        `${process.env.SERVER_HOST_URL}/kpm/login/callback`
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

        log.info(body);

        if (
          validate(body) === true &&
          !parsedBody["cas:serviceResponse"]["cas:authenticationFailure"]
        ) {
          log.info("Helllloooo");
          req.session.userId =
            parsedBody["cas:serviceResponse"]["cas:authenticationSuccess"][
              "cas:user"
            ];
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

app.get("/kpm/logout", (req, res) => {
  req.session.destroy();
  const logoutUrl = new URL(`${process.env.SSO_ROOT_URL}/logout`);
  res.redirect(logoutUrl);
});

app.get("/kpm", async (req, res) => {
  const footer = await fetchBlock("footer");
  const megaMenu = await fetchBlock("megaMenu");
  const search = await fetchBlock("search");

  res.send(
    template({
      footer,
      megaMenu,
      search,
    })
  );
});

module.exports = app;
