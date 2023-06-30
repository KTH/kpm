import { Request, Response, NextFunction } from "express";
import { APICanvasRooms } from "kpm-backend-interface";
import { get_canvas_rooms, sessionUser } from "./common";
import { handleCommonGotErrors } from "./commonErrors";

export async function canvasRoomsApiHandler(
  req: Request,
  res: Response<APICanvasRooms>,
  next: NextFunction
) {
  try {
    const user = sessionUser(req.session);
    const { courseRooms = null, programRooms = null } =
      (await get_canvas_rooms(user.kthid).catch(
        getApiCanvasRoomsErrorHandler
      )) || {};
    res.send({ courseRooms, programRooms });
  } catch (err) {
    next(err);
  }
}

function getApiCanvasRoomsErrorHandler(err: any) {
  handleCommonGotErrors(err);
  // TODO: Add API specific error handling
  Error.captureStackTrace(err, getApiCanvasRoomsErrorHandler);
  throw err;
}
