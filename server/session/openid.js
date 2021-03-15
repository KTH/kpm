let client;
const { Issuer, generators } = require("openid-client");
/**
 * Initializes the OpenID Connect client.
 * Must be called before handling authentication
 */
async function init() {
  const issuer = await Issuer.discover(process.env.OPENID_URL);
  client = new issuer.Client({
    client_id: process.env.OPENID_CLIENT_ID,
    client_secret: process.env.OPENID_CLIENT_SECRET,
    redirect_uris: [`http://localhost:3000/kpm/auth/callback`],
    response_types: ["id_token"],
  });
}

/** Redirects the user to the authentication server */
async function redirectToLogin(req, res) {
  const nonce = generators.nonce();
  const url = client.authorizationUrl({
    scope: "openid email profile",
    response_mode: "form_post",
    nonce,
  });

  req.session.nonce = nonce;
  res.redirect(url);
}

/** Process an incoming request from the authentication server */
async function processCallback(req, res) {
  const params = client.callbackParams(req);
  const nonce = req.session.nonce;

  // Get the Token
  const token = await client
    .callback(`${process.env.SERVER_HOST_URL}/auth/callback`, params, {
      nonce,
    }) // => Promise
    .then(function (tokenSet) {
      console.log("received and validated tokens %j", tokenSet);
      console.log("validated ID Token claims %j", tokenSet.claims());
      return tokenSet.claims();
    });

  console.log("Token", token);

  res.send("Hello ");

  // Store the information in user session

  const userInfo = await client.userinfo(token);
}

module.exports = {
  init,
  redirectToLogin,
  processCallback,
};
