import "./config";
import express, { Request, Response } from "express";
import got from "got";

const port = parseInt(process.env.PORT || "3000");
const prefix = process.env.PROXY_PATH_PREFIX || "/kpm/api";
const MY_CANVAS_ROOMS_API_URI = process.env.MY_CANVAS_ROOMS_API_URI || "http://localhost:3001/kpm/canvas-rooms";
const MY_TEACHING_API_URI = process.env.MY_TEACHING_API_URI || "http://localhost:3002/kpm/teaching";

export const app = express();

// TODO: Add session handling

app.use((req, res, next) => {
  next();
  console.log(`${req.path} => ${res.statusCode}`);
});

const api = express.Router();
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

app.use(prefix, api);

app.use((err: Error, req: Request, res: Response, next: any) => {
  res.status(500).send();
  console.log(`${req.path} => ${err}`);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
