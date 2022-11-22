import express from "express";
import { groupsApiHandler } from "./groups";
import { programmesApiHandler } from "./programmes";
import { servicesApiHandler } from "./services";
import { canvasRoomsApiHandler } from "./canvasRooms";
import { teachingApiHandler } from "./teaching";
import { studiesApiHandler } from "./studies";

export const api = express.Router();

// TODO: Add session handling

api.get("/", (req, res) => {
  return res.send({
    msg: "ok",
  });
});

api.get("/canvas-rooms", canvasRoomsApiHandler);

api.get("/teaching", teachingApiHandler);

api.get("/studies", studiesApiHandler);

api.get("/groups", groupsApiHandler);

api.get("/programmes", programmesApiHandler);

api.get("/services", servicesApiHandler);
