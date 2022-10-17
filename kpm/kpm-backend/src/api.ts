import express from "express";
import got from "got";
import {
  APIStudies,
  APITeaching,
  APICanvasRooms
} from "kpm-backend-interface";

const MY_CANVAS_ROOMS_API_URI = process.env.MY_CANVAS_ROOMS_API_URI || "http://localhost:3001/kpm/canvas-rooms";
const MY_TEACHING_API_URI = process.env.MY_TEACHING_API_URI || "http://localhost:3002/kpm/teaching";
const MY_STUDIES_API_URI = process.env.MY_STUDIES_API_URI || "http://localhost:3003/kpm/studies";

export const api = express.Router();

// TODO: Add session handling

api.get("/", (req, res) => {
  return res.send({
    msg: "ok"
  })
})

api.get("/canvas-rooms", async (req, res) => {
  const { rooms } = await got.get<any>(`${MY_CANVAS_ROOMS_API_URI}/user/u1famwov`, {
    responseType: "json"
  }).then((r) => r.body);

  res.send({
    rooms
  } as APICanvasRooms);
})

api.get("/teaching", async (req, res) => {
  const courses = await got.get<any>(`${MY_TEACHING_API_URI}/user/u1famwov`, {
    responseType: "json"
  }).then((r) => r.body);

  res.send({
    courses
  } as APITeaching);
})

api.get("/studies", async (req, res) => {
  const { courses, programmes } = await got.get<any>(`${MY_STUDIES_API_URI}/user/u1famwov`, {
    responseType: "json"
  }).then((r) => r.body);

  res.send({
    courses,
    programmes
  } as APIStudies);
})