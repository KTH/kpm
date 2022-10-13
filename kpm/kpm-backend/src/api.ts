import express from "express";
import got from "got";

const MY_CANVAS_ROOMS_API_URI = process.env.MY_CANVAS_ROOMS_API_URI || "http://localhost:3001/kpm/canvas-rooms";
const MY_TEACHING_API_URI = process.env.MY_TEACHING_API_URI || "http://localhost:3002/kpm/teaching";

export const api = express.Router();

api.get("/", (req, res) => {
  res.send({ msg: "Hello World!!!" });
});

// TODO: Add session handling

api.get("/", (req, res) => {
  return res.send({
    msg: "ok"
  })
})

api.get("/teaching", async (req, res) => {
  const resTeaching = await got.get(`${MY_TEACHING_API_URI}/user/u1famwov`, {
    responseType: "json"
  }).then((r) => r.body);
  
  res.send({
    teaching: resTeaching,
  });
})