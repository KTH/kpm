import { Router } from "express";
import { Issuer, BaseClient, generators, errors } from "openid-client";
import assert from "node:assert/strict";

/**
 * Extends "express-session" by declaring the data stored in session object
 */
declare module "express-session" {
  interface SessionData {
    tmpNonce?: string;
    user?: TSessionUser;
  }
}

export type TSessionUser = {
  kthid: string;
  display_name: string;
  email?: string;
  username?: string;
  exp: number;
  nbf: number;
};

// Should these variables (PREFIX, PORT, PROXY_HOST) be defined in one place?
const PREFIX = process.env.PROXY_PATH_PREFIX || "/kpm";
const PORT = process.env.PORT || 3000;
const PROXY_HOST = process.env.PROXY_HOST || `http://localhost:${PORT}`;
const SKIP_LOGIN = process.env.SKIP_LOGIN === "true";
const IS_DEV = process.env.NODE_ENV !== "production";

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

  if (typeof nextUrl !== "string") {
    // TODO: better error handling
    return res.status(400).send("nextUrl should be a string");
  }

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

auth.get("/logout", async function logoutHandler(req, res) {
  const nextUrl = req.query.nextUrl || "https://www.kth.se";
  req.session.user = undefined;
  const url = client.endSessionUrl({
    redirect_uri: nextUrl,
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

    const user = createValidSesisonUser(claims);
    if (isValidSession(user)) {
      req.session.user = user;
    } else {
      //
      console.log("Invalid TSessionUser object.");
    }
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

export function getFakeUserForDevelopment(): TSessionUser | undefined {
  if (SKIP_LOGIN && IS_DEV)
    return {
      kthid: "u1i6bme8",
      display_name: "Test Userson",
      email: "test@email.com",
      username: "testuser",
      exp: Date.now() / 1000 + 3600,
      nbf: Date.now() / 1000,
    };
}

export function requiresValidSessionUser(
  req: Express.Request,
  res: Express.Response,
  next: Function
) {
  // Allow running locally without login
  if (SKIP_LOGIN) return next();

  if (!isValidSession(req.session.user)) {
    throw new Error("Not a valid TSessionUser");
  }

  next();
}

export function isValidSession(user?: TSessionUser) {
  if (user === undefined) return false;

  // TODO: Clear session if not valid
  const { exp, nbf } = user;
  const now = Date.now() / 1000;
  return exp > now && nbf < now;
}

function createValidSesisonUser(claim: any): TSessionUser {
  // TODO: Be a bit more picky and log detailed error if claim doesn't contain what we need
  return {
    kthid: claim.kthid,
    display_name: claim.unique_name[0],
    email: claim.email,
    username: claim.username,
    exp: claim.exp,
    nbf: claim.nbf,
  };
}
