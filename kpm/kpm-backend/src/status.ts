import express from "express";

export const status = express.Router();

status.get("/_monitor", (_req, res) => {
  res.send("APPLICATION_STATUS: OK");
});