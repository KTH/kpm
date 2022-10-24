import { Router } from "express";
import { Issuer, BaseClient, generators, errors } from "openid-client";
import assert from "node:assert/strict";

/**
 * Extends "express-session" by declaring the data stored in session object
 */
declare module "express-session" {
  interface SessionData {
    tmpNonce: string;
  }
}

// Should these variables (PREFIX, PORT, PROXY_HOST) be defined in one place?
const PREFIX = process.env.PROXY_PATH_PREFIX || "/kpm";
const PORT = process.env.PORT || 3000;
const PROXY_HOST = process.env.PROXY_HOST || `http://localhost:${PORT}`;

const redirectBaseUrl = new URL(`${PREFIX}/auth/callback`, PROXY_HOST);
/**
 * Router containing all /auth related endpoints
 */
export const auth = Router();

let client: BaseClient;

async function getOpenIdClient() {
  if (client) return client;

  const issuer = await Issuer.discover(process.env.OIDC_URL || "");
  client = new issuer.Client({
    client_id: process.env.OIDC_CLIENT_ID || "",
    client_secret: process.env.OIDC_CLIENT_SECRET || "",
    redirect_uris: [redirectBaseUrl.toString()],
    response_types: ["id_token"],
  });

  return client;
}

// Example: /kpm/auth/login?nextUrl=https://kth.se&prompt=none
auth.get("/login", async function checkHandler(req, res) {
  const nextUrl = req.query.nextUrl;
  assert(typeof nextUrl === "string", "nextUrl should be a string");

  // prompt should have value "none". Otherwise it is interpreted as `undefined`
  const prompt = req.query.prompt === "none" ? "none" : undefined;

  const client = await getOpenIdClient();
  const nonce = generators.nonce();
  const redirectUrl = new URL(redirectBaseUrl);
  redirectUrl.searchParams.set("nextUrl", nextUrl);

  req.session.tmpNonce = nonce;

  const url = client.authorizationUrl({
    scope: "openid email profile",
    redirect_uri: redirectUrl.toString(),
    response_mode: "form_post",
    prompt,
    nonce,
  });

  res.redirect(url);
});

auth.post("/callback", async function callbackHandler(req, res, next) {
  const client = await getOpenIdClient();
  const params = client.callbackParams(req);
  const nextUrl = req.query.nextUrl;
  assert(typeof nextUrl === "string", "nextUrl should be a string");

  const redirectUrl = new URL(redirectBaseUrl);
  redirectUrl.searchParams.set("nextUrl", nextUrl);

  try {
    const claims = await client
      .callback(redirectUrl.toString(), params, {
        nonce: req.session.tmpNonce,
      })
      .then((tokenSet) => tokenSet.claims());

    // TODO: do something with `claims` (includes user ID, etc)
    res.redirect(nextUrl);
  } catch (err) {
    if (err instanceof errors.OPError) {
      if (err.error === "login_required") {
        // user is logged out
        res.redirect(`${nextUrl}?login_success=false`);
        return;
      }
    }
    next(err);
  }
});
