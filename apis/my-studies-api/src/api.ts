import express, { NextFunction, Request, Response } from "express";
import { UGRestClient, UGRestClientError } from "kpm-ug-rest-client";
import { parseUgGroupNames } from "./apiUtils";
import { TAPIUserStudies } from "./interfaces";

const IS_DEV = process.env.NODE_ENV !== "production";
const CLIENT_ID = process.env.CLIENT_ID!; // Required in .env.in
const CLIENT_SECRET = process.env.CLIENT_SECRET!; // Required in .env.in
const OAUTH_SERVER_BASE_URI =
  process.env.OAUTH_SERVER_BASE_URI || "https://login.ref.ug.kth.se/adfs";
const UG_REST_BASE_URI =
  process.env.UG_REST_BASE_URI || "https://integral-api.sys.kth.se/test/ug";

export const api = express.Router();

api.get("/mine", (req, res) => {
  res.send({ msg: "Not implemented yet." });
});

// Expected values from UG
export type TUgUser = {
  affiliations: string[];
  givenName: string;
  kthid: string;
  memberOf: string;
  primaryAffiliation: string;
  surname: string;
  username: string;
};

export type TUgGroup = {
  description: {
    sv: string;
    en: string;
  };
  kthid: string;
  name: string;
};

const ugClient = new UGRestClient({
  authServerDiscoveryURI: OAUTH_SERVER_BASE_URI,
  resourceBaseURI: UG_REST_BASE_URI,
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
});

api.get(
  "/user/:user",
  async (req: Request, res: Response<TAPIUserStudies>, next: NextFunction) => {
    try {
      const userName = req.params.user;

      const perf1 = Date.now();

      const { data, json, statusCode } =
        (await ugClient
          .get<{ memberOf: TUgGroup[] }[]>(
            `users?$filter=kthid eq '${userName}'&$expand=memberOf`
          )
          .catch(ugClientGetErrorHandler)) || {};
      // console.debug(`Exec time: ${Date.now() - perf1}ms`);

      if (json === undefined || statusCode !== 200) {
        if (IS_DEV) {
          return res.status(statusCode || 500).send(data as any);
        }
      }

      const allGroupNames = json![0]?.memberOf.map((o) => o.name);

      res.status(statusCode || 200).send(parseUgGroupNames(allGroupNames));
    } catch (err) {
      next(err);
    }
  }
);

function ugClientGetErrorHandler(err: any) {
  if (err instanceof UGRestClientError) {
    throw err;
  }

  Error.captureStackTrace(err, ugClientGetErrorHandler);
  throw err;
}
