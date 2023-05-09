import { Router, Response } from "express";
import log, { runWithSkog } from "skog";
import { Issuer, BaseClient, generators, errors } from "openid-client";
import assert from "node:assert/strict";
import { AuthError, MutedAuthError } from "kpm-api-common/src/errors";
import { getSocial } from "./api/common";
import {
  APIAuthErrType,
  APIMutedAuthErrType,
  TSessionUser,
} from "kpm-backend-interface";
import { SESSION_MAX_AGE_MS } from "./session";
import logger from "skog";

/**
 * Extends "express-session" by declaring the data stored in session object
 */
declare module "express-session" {
  interface SessionData {
    tmpNonce?: string;
    user?: TSessionUser;
  }
}

// Should these variables (PREFIX, PORT, PROXY_HOST) be defined in one place?
const PREFIX = process.env.PROXY_PATH_PREFIX || "/kpm";
const PORT = process.env.PORT || 3000;
const PROXY_HOST = process.env.PROXY_HOST || `http://localhost:${PORT}`;
const USE_FAKE_USER = process.env.USE_FAKE_USER;
const IS_DEV = process.env.NODE_ENV !== "production";
const IS_STAGE = process.env.DEPLOYMENT === "stage";
const LOAD_TEST_TOKEN = process.env.LOAD_TEST_TOKEN;

export const LANG_COOKIE_OPTS = PROXY_HOST.includes("localhost")
  ? ({} as const)
  : ({
      domain: ".kth.se",
      maxAge: 90 * 24 * 3600 * 1000,
      sameSite: "none",
      secure: true,
    } as const);

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

/**
 * The following endpoint allows us to perform load testing
 * without logging in as each user which would require
 * passwords and a complete OAuth2 login flow.
 */
if (IS_DEV || IS_STAGE) {
  if (LOAD_TEST_TOKEN) {
    log.warn("LOAD_TEST_TOKEN found -- ready for load testing!");
  }
  auth.get("/load-test-session-init", function initSession(req, res) {
    if (!LOAD_TEST_TOKEN) {
      // Don't allow this to be called unless a token is set
      return res.status(403);
    }

    if (req.headers.authorization !== LOAD_TEST_TOKEN) {
      return res.status(401).send("Invalid access token" as any);
    }

    log.info("session init");

    const userId = req.query.id?.toString();
    if (userId !== undefined) {
      req.session.user = {
        kthid: userId,
        display_name: req.query.name?.toString() ?? "Test Userson",
        email: req.query.email?.toString() ?? "test@email.com",
        username: req.query.username?.toString() ?? "testuser",
        hasEduCourses: true,
        hasLadokCourses: true,
        numNewNotifications: 0,
        expires: new Date().getTime() + SESSION_MAX_AGE_MS,
      };
    }

    res.send(req.session.user?.kthid);
  });
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
  const client = await getOpenIdClient();
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
      .then((tokenSet) => tokenSet.claims())
      .catch(openIdErr);

    const user =
      (IS_DEV || IS_STAGE) && USE_FAKE_USER
        ? getFakeUserForDevelopment()
        : createValidSesisonUser(claims);

    throwIfNotValidSession(user);

    let lang_resp = await getSocial<LangResponse>(
      user!,
      "lang",
      undefined
    ).catch(socialErr);
    let lang = lang_resp.lang;
    logger.info({ lang, kthid: user?.kthid }, "Language according to social");

    req.session.user = user;
    if (lang) {
      res.cookie("language", lang, LANG_COOKIE_OPTS);
    }
    setSsoCookie(res);
    res.redirect(nextUrl);
  } catch (err) {
    clearSsoCookie(res);
    if (err instanceof errors.OPError && err.error === "login_required") {
      // user is logged out
      res.redirect(`${nextUrl}?login_success=false`);
      return;
    }

    next(err);
  }
});

const SSO_COOKIE_OPTIONS = {
  domain: ".kth.se",
  maxAge: 4 * 60 * 60 * 1000,
  httpOnly: false,
  secure: true,
  sameSite: "none",
} as const;

export function setSsoCookie(res: Response) {
  res.cookie("KTH_SSO_START", "t", SSO_COOKIE_OPTIONS);
}
export function clearSsoCookie(res: Response) {
  const { maxAge, ...COOKIE_OPTIONS } = SSO_COOKIE_OPTIONS;
  res.clearCookie("KTH_SSO_START", {
    ...COOKIE_OPTIONS,
  });
}

type LangResponse = {
  lang: "sv" | "en" | null;
};

function socialErr(error: any): LangResponse {
  logger.error({ error }, "Failed to contact social, language prefs unknown");
  return { lang: null };
}

function openIdErr(err: any) {
  // https://github.com/panva/node-openid-client/blob/main/docs/README.md#errors
  if (err instanceof errors.OPError) {
    // Trigger login (logged as warning)
    if (err.error === "login_required")
      throw new MutedAuthError<APIMutedAuthErrType>({
        type: "LoginRequired",
        message: "Login required",
        err,
      });

    // We get weird misc errors from auth server that don't appear to be severe (logged as warning)
    throw new MutedAuthError<APIMutedAuthErrType>({
      type: "AuthServiceMiscError",
      message: "Misc auth service error, check err property for details",
      err,
    });
  } else if (err instanceof errors.RPError) {
    // This is a setup error with our auth service and should be logged as a proper error
    throw new AuthError<APIAuthErrType>({
      type: "ClientResponseError",
      message: "Login failed due to invalid response",
      details: err,
    });
  } else if (err instanceof TypeError) {
    // This is a programmer error and should be logged as a proper error
    throw new AuthError<APIAuthErrType>({
      type: "TypeError",
      message: "Login failed due to unexpected argument types",
      details: err,
    });
  }

  Error.captureStackTrace(err, openIdErr);
  throw err;
}

export function getFakeUserForDevelopment(): TSessionUser | undefined {
  if ((IS_DEV || IS_STAGE) && USE_FAKE_USER)
    return {
      kthid: USE_FAKE_USER,
      display_name: "Test Userson",
      email: "test@email.com",
      username: "testuser",
      hasEduCourses: true,
      hasLadokCourses: true,
      numNewNotifications: 0,
      expires: new Date().getTime() + SESSION_MAX_AGE_MS,
    };
}

export function requiresValidSessionUser(
  req: Express.Request,
  res: Express.Response,
  next: Function
) {
  try {
    // Allow running locally without login
    if (IS_DEV && USE_FAKE_USER) return next();

    throwIfNotValidSession(req.session.user);

    // runWithSkog calls next()
    runWithSkog(
      {
        username: req.session.user?.username,
        kthid: req.session.user?.kthid,
      },
      next as () => unknown
    );
  } catch (err) {
    return next(err);
  }
}

export function throwIfNotValidSession(user?: TSessionUser): void {
  if (user === undefined) {
    throw new MutedAuthError<APIMutedAuthErrType>({
      type: "SessionStoreError",
      message: "No logged in user found",
    });
  }

  // TODO: Clear session if not valid
  if (!isValidSession(user)) {
    throw new MutedAuthError<APIMutedAuthErrType>({
      type: "SessionExpired",
      message: "Your session has expired",
      details: user,
    });
  }
}

export function isValidSession(user?: TSessionUser): boolean {
  if (user === undefined) return false;

  const { expires } = user;
  const now = Date.now() / 1000;
  return expires > now;
}

function createValidSesisonUser(claim: any): TSessionUser {
  // Single values are returned as a string but we expect an array
  if (typeof claim.memberOf === "string") {
    claim.memberOf = [claim.memberOf];
  }

  // Undefined is a valid value for claim.memberOf if no memberships exist
  if (claim.memberOf !== undefined && !Array.isArray(claim.memberOf)) {
    log.error(
      `Unexpected value [claim.memberOf: ${claim.memberOf}] for username ${claim.username} (${claim.kthid})`
    );
  }

  const hasLadokCourses =
    claim.memberOf?.some?.((group: string) =>
      group.startsWith("ladok2.kurser")
    ) ?? false;
  const hasEduCourses =
    claim.memberOf?.some?.((group: string) =>
      group.startsWith("edu.courses")
    ) ?? false;
  return {
    kthid: claim.kthid,
    display_name: claim.unique_name[0],
    email: claim.email,
    username: claim.username,
    hasEduCourses,
    hasLadokCourses,
    expires: new Date().getTime() + SESSION_MAX_AGE_MS,
  };
}
