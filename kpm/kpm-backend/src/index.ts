import "./config";
import express from "express";
import {
  loggingHandler,
  errorHandler,
  uncaughtExceptionCallback,
} from "kpm-api-common";
import { name as APP_NAME } from "../package.json";
import { api } from "./api";

const PORT = parseInt(process.env.PORT || "3000");
const PREFIX = process.env.PROXY_PATH_PREFIX || "/kpm/api";

export const app = express();

process.on("uncaughtException", uncaughtExceptionCallback);
app.use(loggingHandler);
app.use(PREFIX, api);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`${APP_NAME} listening on port ${PORT}`);
});
