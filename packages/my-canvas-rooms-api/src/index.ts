/* Top-level source file for my-canvas-rooms-api */
import { config } from "dotenv";
config();

import express from "express";
import CanvasClient from "./canvasApi";

const app = express();
const port = parseInt(process.env.PORT || "3000");
const prefix = process.env.PREFIX || "/kpm/canvas-rooms";

const api = express.Router();

api.get("/", (req, res) => {
  res.send({ msg: "Hello World!!!" });
});

api.get("/mine", (req, res) => {
  res.send({ msg: "Not implemented yet." });
});
api.get("/user/:user", async (req, res) => {
  const canvas = CanvasClient(req);
  const rooms = canvas.getRooms(`sis_user_id:${req.params.user}`);
  let result = {};
  for await (room of rooms) {
    // Each canvas room may belong to multiple courses, and each
    // course usually has many canvas rooms.
    let { codes, link } = get_rooms_courses_and_link(room);
    for (code of codes) {
      if (result[code]) {
        result[code].add(link);
      } else {
        result[code] = new Set([link]);
      }
      result.getdefault(code, {}).add(link);
    }
  }
  res.send({ rooms: result });
});

app.use((req, res, next) => {
  next();
  console.log(`${req.path} => ${res.statusCode}`);
});
app.use(prefix, api);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

function get_rooms_courses_and_link(room) {
  // FIXME
  return { codes, link };
}
