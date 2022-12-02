import expressSession from "express-session";
import cookieParser from "cookie-parser";

const SESSION_SECRET = process.env.SESSION_SECRET || "kpm";
const PORT = process.env.PORT || 3000;
const PROXY_HOST = process.env.PROXY_HOST || `http://localhost:${PORT}`;
const IS_HTTPS = PROXY_HOST.startsWith("https:");

export const sessionMiddleware = expressSession({
  name: "kpm.sid",
  proxy: true,
  // store: store,
  cookie: {
    domain: new URL(PROXY_HOST).hostname,
    maxAge: 14 * 24 * 3600 * 1000,
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
});

// Using cookie-parser may result in issues if the secret is not the same between this module and cookie-parser.
// https://expressjs.com/en/resources/middleware/session.html
export const cookieParserMiddleware = cookieParser(SESSION_SECRET, {
  secure: IS_HTTPS,
  sameSite: IS_HTTPS ? "none" : undefined,
} as any);
