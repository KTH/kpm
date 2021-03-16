let client;
const { Issuer, generators } = require("openid-client");
const { Router } = require("express");
const extractInfoFromToken = require("./extract-info");

const router = Router();

/**
 * Initializes the OpenID Connect client.
 * Must be called before handling authentication
 */
async function init() {
  const issuer = await Issuer.discover(process.env.OPENID_URL);
  client = new issuer.Client({
    client_id: process.env.OPENID_CLIENT_ID,
    client_secret: process.env.OPENID_CLIENT_SECRET,
    redirect_uris: [`${process.env.SERVER_HOST_URL}/kpm/auth/callback`],
    response_types: ["id_token"],
  });
}

router.get("/login", async function (req, res) {
  const nonce = generators.nonce();
  const url = client.authorizationUrl({
    scope: "openid email profile",
    response_mode: "form_post",
    nonce,
  });

  req.session.tmp = {
    nonce,
    next: req.query.next,
  };
  res.redirect(url);
});

/** Process an incoming request from the authentication server */
router.post("/callback", async function (req, res) {
  const params = client.callbackParams(req);
  const { nonce, next } = req.session.tmp;
  delete req.session.tmp;

  const token = await client
    .callback(`${process.env.SERVER_HOST_URL}/auth/callback`, params, {
      nonce,
    })
    .then(function (tokenSet) {
      return tokenSet.claims();
    });

  req.session.userId = token.kthid;
  res.redirect(next);

  req.session.userData = await extractInfoFromToken(token);
  req.session.save();
});

router.get("/logout", async function (req, res) {
  req.session.destroy();
  res.redirect(client.endSessionUrl());
});

module.exports = {
  init,
  router,
};
