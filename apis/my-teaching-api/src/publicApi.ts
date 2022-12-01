import express from "express";

export const api = express.Router();

api.get("/", (_req, res) => {
  res.send({ msg: "Hello World!!!" });
});
api.get("/_monitor", (_req, res) => {
  res.send("APPLICATION_STATUS: OK");
});
