import express from "express";
import { groupsApiHandler } from "./groups";
import { programmesApiHandler } from "./programmes";
import { servicesApiHandler } from "./services";
import { canvasRoomsApiHandler } from "./canvasRooms";
import { teachingApiHandler } from "./teaching";
import { studiesApiHandler } from "./studies";
import { starApiHandler } from "./star";
import { langApiHandler } from "./lang";

export const api = express.Router();

// TODO: Add proper session handling
api.get("/", (req, res) => {
  return res.send({
    msg: "ok",
  });
});

api.get("/canvas-rooms", (req, res, next) => {
  try {
    canvasRoomsApiHandler(req, res, next);
  } catch (e) {
    next(e);
  }
});

api.post("/lang", langApiHandler);

api.get("/teaching", teachingApiHandler);

api.get("/studies", studiesApiHandler);

api.get("/groups", groupsApiHandler);

api.get("/programmes", programmesApiHandler);

api.get("/services", servicesApiHandler);

api.post("/star", starApiHandler);
