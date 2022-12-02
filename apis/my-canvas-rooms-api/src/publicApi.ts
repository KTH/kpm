import express, { NextFunction, Request, Response } from "express";

export const status = express.Router();

status.get("/", (_req, res) => {
  res.send({ msg: "Hello World!!!" });
});
status.get("/_monitor", (_req, res) => {
  res.send("APPLICATION_STATUS: OK");
});
