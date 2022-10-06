import express from "express";
import got from "got";

const MY_TEACHING_API_URI =
  process.env.MY_TEACHING_API_URI || "http://localhost:3002/kpm/teaching";

const apiRouter = express.Router();

apiRouter.get("/", (req, res) => {
  return res.send({
    msg: "ok",
  });
});

apiRouter.get("/teaching", async (req, res) => {
  const resTeaching = await got
    .get(`${MY_TEACHING_API_URI}/user/u1famwov`, {
      responseType: "json",
    })
    .then((r) => r.body);

  res.send({
    teaching: resTeaching,
  });
});

export default apiRouter;
