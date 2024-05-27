import "./config";
import express from "express";
import { loggingHandler, errorHandler } from "kpm-api-common";
import { api } from "./api";
import { status } from "./status";
import { auth, requiresValidSessionUser } from "./auth";
import {
  sessionMiddleware,
  cookieParserMiddleware,
  sessionApiHandler,
} from "./session";
import log from "skog";
import { widgetJsHandler, widgetJsAssets } from "./widget.js";
import cors from "cors";
import { activation } from "./activation";
import { MutedOperationalError } from "kpm-api-common/src/errors";
import { TCorsError } from "kpm-backend-interface";

const IS_DEV = process.env.NODE_ENV !== "production";
const IS_STAGE = process.env.DEPLOYMENT === "stage";
const PORT = parseInt(process.env.PORT || "3000");
const PREFIX = process.env.PROXY_PATH_PREFIX || "/kpm";

export const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use(cookieParserMiddleware);
app.use(loggingHandler);

class CorsError extends MutedOperationalError<TCorsError> {
  constructor({
    message,
    type,
    details = undefined,
    err = undefined,
  }: {
    message: string;
    type: TCorsError;
    details?: any;
    err?: Error;
  }) {
    super({
      name: "CorsError",
      statusCode: 403,
      type,
      message,
      details,
      err,
    });
  }
}

let corsWhitelist: string[] = [];
if (IS_STAGE || IS_DEV) {
  corsWhitelist = [
    "http://localhost:4321",
    "https://app-r.referens.sys.kth.se",
    "https://intra-r.referens.sys.kth.se",
    "https://kth.beta.instructure.com",
    "https://kth.test.instructure.com",
    "https://login.ref.ug.kth.se",
    "https://vc-dev-8-r.referens.sys.kth.se",
    "https://www-edit-r-new.referens.sys.kth.se",
    "https://www-edit-r.referens.sys.kth.se",
    "https://www-r-new.referens.sys.kth.se",
    "https://www-r.referens.sys.kth.se",
  ];
} else if (!IS_DEV) {
  corsWhitelist = [
    "https://api.kth.se",
    "https://app.kth.se",
    "https://canvas.kth.se",
    "https://common.sys.kth.se",
    "https://intra.kth.se",
    "https://ita.ug.kth.se",
    "https://kth.instructure.com",
    // "https://kth.se",
    "https://login.ug.kth.se",
    "https://www-edit.sys.kth.se",
    "https://www.access.kth.se",
    "https://www.aphys.kth.se",
    "https://www.arch.kth.se",
    "https://www.byv.kth.se",
    "https://www.cas.kth.se",
    "https://www.ccgex.kth.se",
    "https://www.cekert.kth.se",
    "https://www.cesc.kth.se",
    "https://www.cesis.kth.se",
    "https://www.cexs.kth.se",
    "https://www.cfp.abe.kth.se",
    "https://www.chs.kth.se",
    "https://www.ciam.kth.se",
    "https://www.ctr.kth.se",
    "https://www.cts.kth.se",
    "https://www.e-ladda.proj.kth.se",
    "https://www.eco2vehicledesign.kth.se",
    "https://www.energy.kth.se",
    "https://www.flow.kth.se",
    "https://www.fluidphyslab.kth.se",
    "https://www.fpl.mech.kth.se",
    "https://www.greenleap.kth.se",
    "https://www.hallf.kth.se",
    "https://www.holding.kth.se",
    "https://www.ict-tng.kth.se",
    "https://www.iip.kth.se",
    "https://www.itrl.kth.se",
    "https://www.kth.se",
    "https://www.liveinlab.kth.se",
    "https://www.mgm-negaf.proj.kth.se",
    "https://www.mmd.center.kth.se",
    "https://www.mse.kth.se",
    "https://www.particle.kth.se",
    "https://www.pdc.kth.se",
    "https://www.physics.kth.se",
    "https://www.prodeox.proj.kth.se",
    "https://www.qeo.kth.se",
    "https://www.qnp.aphys.kth.se",
    "https://www.r1.kth.se",
    "https://www.ramp.proj.kth.se",
    "https://www.reactor.sci.kth.se",
    "https://www.sams.kth.se",
    "https://www.skc.kth.se",
    "https://www.ssc.kth.se",
    "https://www.wasp.kth.se",
  ];
}

if (IS_DEV) {
  corsWhitelist.push(`http://localhost:${PORT}`); // Local assets
  corsWhitelist.push("null"); // We got this origin at /callback during silent auth flow
}

// We are behind a proxy and need to set proper origin etc.
// https://expressjs.com/en/guide/behind-proxies.html
app.set("trust proxy", true);
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || corsWhitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(
          new CorsError({
            message: `Not allowed by CORS (origin: ${origin})`,
            type: "InvalidOrigin",
            details: { origin },
          })
        );
      }
    },
    credentials: true,
  })
);

app.use(`${PREFIX}`, status);
app.use(`${PREFIX}/auth`, auth);
app.use(`${PREFIX}/api/session`, sessionApiHandler);
app.use(`${PREFIX}/api`, requiresValidSessionUser, api);
app.use(`${PREFIX}/kpm.js`, widgetJsHandler);
app.use(`${PREFIX}/assets`, widgetJsAssets);
app.use(`${PREFIX}`, activation);

app.use(errorHandler);

app.listen(PORT, () => {
  log.info(`Listening on port ${PORT}`);
  if (process.env.DEPLOYMENT) {
    log.info(`process.env.DEPLOYMENT = ${process.env.DEPLOYMENT}`);
  }
});
