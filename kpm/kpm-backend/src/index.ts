import "./config";
import express, { Request, Response } from "express";

const port = parseInt(process.env.PORT || "3000");
const prefix = process.env.PREFIX || "/kpm";

export const app = express();

app.use((req, res, next) => {
  next();
  console.log(`${req.path} => ${res.statusCode}`);
});

app.use((err: Error, req: Request, res: Response, next: any) => {
  res.status(500).send();
  console.log(`${req.path} => ${err}`);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
