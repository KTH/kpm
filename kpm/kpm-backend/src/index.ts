import "./config";
import express from "express";
import {
  loggingHandler,
  errorHandler,
  uncaughtExceptionCallback,
} from "kpm-api-common";
import { name as APP_NAME } from "../package.json";
import { api } from "./api";
import { auth } from "./auth";
import { sessionMiddleware } from "./session";

const PORT = parseInt(process.env.PORT || "3000");
const PREFIX = process.env.PROXY_PATH_PREFIX || "/kpm";

export const app = express();

process.on("uncaughtException", uncaughtExceptionCallback);

app.use(express.json());
app.use(express.urlencoded());
app.use(sessionMiddleware);
app.use(loggingHandler);
app.use(`${PREFIX}/auth`, auth);
app.use(`${PREFIX}/api`, api);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`${APP_NAME} listening on port ${PORT}`);
});
