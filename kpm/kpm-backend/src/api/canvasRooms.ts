import { Request, Response, NextFunction } from "express";
import { APICanvasRooms } from "kpm-backend-interface";
import { get_canvas_rooms, sessionUser } from "./common";

export async function canvasRoomsApiHandler(req: Request, res: Response<APICanvasRooms>, next: NextFunction) {
  try {
    const user = sessionUser(req.session);
    const { rooms } = await get_canvas_rooms(user.kthid);
    res.send({ rooms });
  } catch (err) {
    next(err);
  }
}