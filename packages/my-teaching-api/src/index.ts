/* Top-level source file for my-teaching-api */
import { config } from "dotenv";
config();

import express from "express";

const app = express();
const port = parseInt(process.env.PORT || "3000");
const prefix = process.env.PREFIX || "/kpm/teaching";

const api = express.Router();

api.get("/", (req, res) => {
  res.send({ msg: "Hello World!!!" });
});

api.get("/mine", (req, res) => {
  res.send({ msg: "Not implemented yet." });
});
api.get("/user/:user", (req, res) => {
  res.send({ msg: `todo: data for ${req.params.user}` });
});

app.use((req, res, next) => {
  next();
  console.log(`${req.path} => ${res.statusCode}`);
});
app.use(prefix, api);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
