import expressSession from "express-session";
import cookieParser from "cookie-parser";
import connectRedis, { RedisStore } from "connect-redis";
import { getRedisClient } from "./redisClient";
import { APIMutedAuthErrType, APISession } from "kpm-backend-interface";
import { Request, Response, NextFunction } from "express";
import { sessionUser } from "./api/common";
import { MutedAuthError } from "kpm-api-common/src/errors";
import { getSocial } from "./api/common";
import logger from "skog";

const SESSION_SECRET = process.env.SESSION_SECRET || "kpm";
const PORT = process.env.PORT || 3000;
const PROXY_HOST = process.env.PROXY_HOST || `http://localhost:${PORT}`;
const IS_HTTPS = PROXY_HOST.startsWith("https:");
export const SESSION_MAX_AGE_MS = 14 * 24 * 3600 * 1000;

const redisClient = getRedisClient();
let redisStore: RedisStore | undefined = undefined;
if (redisClient) {
  // Initialize session store
  // See: https://www.npmjs.com/package/connect-redis
  const RedisStore = connectRedis(expressSession);
  redisStore = new RedisStore({ client: redisClient });
}

export const sessionMiddleware = expressSession({
  name: "kpm.sid",
  proxy: true,
  // store: store,
  cookie: {
    domain: new URL(PROXY_HOST).hostname,
    maxAge: SESSION_MAX_AGE_MS,
    httpOnly: true,
    // https://www.codeconcisely.com/posts/how-to-set-up-cors-and-cookie-session-in-express/
    secure: IS_HTTPS,
    sameSite: IS_HTTPS ? "none" : undefined,
  },

  // Read more: https://www.npmjs.com/package/express-session#resave
  resave: false,

  // Save only sessions when user is authenticated. Setting "saveUnitialized"
  // to "false" prevents creation of sessions when app is accessed via API
  saveUninitialized: false,
  secret: SESSION_SECRET,

  store: redisStore, // if undefined, we use the memory store
});

// Using cookie-parser may result in issues if the secret is not the same between this module and cookie-parser.
// https://expressjs.com/en/resources/middleware/session.html
export const cookieParserMiddleware = cookieParser(SESSION_SECRET, {
  secure: IS_HTTPS,
  sameSite: IS_HTTPS ? "none" : undefined,
  secret: SESSION_SECRET,
} as any);

// Get current session user
export async function sessionApiHandler(
  req: Request,
  res: Response<APISession>, // FIXME: Response type!
  next: NextFunction
) {
  try {
    const user = sessionUser(req.session);
    if (user) {
      let notes = await getSocial<NumNotes>(user, "notifications/count").catch(
        socialErr
      );
      logger.info({ notes, kthid: user.kthid }, "Notes according to social");
      user.numNewNotifications = notes?.new;
    }
    res.send({ user });
  } catch (err: any) {
    if (err instanceof MutedAuthError) {
      if (err.type === "NoSessionUser") {
        res.send({ user: undefined });
        return;
      }
    }

    next(err);
  }
}

function socialErr(error: any): undefined {
  logger.error({ error }, "Failed to contact social, showing no notifications");
  return undefined;
}

type NumNotes = {
  new: number;
};
