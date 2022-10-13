import { Router } from "express";
import { Issuer, BaseClient, generators } from "openid-client";
import assert from "node:assert/strict";

const PREFIX = process.env.PROXY_PATH_PREFIX || "/kpm";

/**
 * Extends "express-session" by declaring the data stored in session object
 */
declare module "express-session" {
  interface SessionData {
    tmpNonce: string;
  }
}

const redirectBaseUrl = new URL(`${PREFIX}/auth/callback`, process.env.PROXY_HOST);
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
auth.get("/auth/login", async function checkHandler(req, res) {
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

auth.post("/auth/callback", async function callbackHandler(req, res) {
  const client = await getOpenIdClient();
  const params = client.callbackParams(req);
  // breakpoint

  const redirectUrl = ""; // TODO: take this param from req

  // TODO: get nonce from session
  // TODO: Check if error

  const claims = await client
    .callback("...", params, {
      // nonce
    })
    .then((tokenSet) => tokenSet.claims());

  // TODO: save tokens (contained in claims) in session
  res.redirect(redirectUrl);
});
