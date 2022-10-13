import expressSessio from "express-session";

const SESSION_SECRET = process.env.SESSION_SECRET || "";
const PROXY_HOST = process.env.PROXY_HOST || "";

export const sessionMiddleware = expressSessio({
    name: "kpm.sid",
    proxy: true,
    // store: store,
    cookie: {
      domain: new URL(PROXY_HOST).hostname,
      maxAge: 14 * 24 * 3600 * 1000,
      httpOnly: true,
      secure: "auto",
      sameSite: "none",
    },

    // Read more: https://www.npmjs.com/package/express-session#resave
    resave: false,

    // Save only sessions when user is authenticated. Setting "saveUnitialized"
    // to "false" prevents creation of sessions when app is accessed via API
    saveUninitialized: false,
    secret: SESSION_SECRET,
  });
