import { Request, Response, NextFunction } from "express";
import { APIProgrammes, TCanvasRoom } from "kpm-backend-interface";
import { get_canvas_rooms, sessionUser } from "./common";
import log from "skog";
import { handleCommonGotErrors } from "./commonErrors";

export async function programmesApiHandler(
  req: Request,
  res: Response<APIProgrammes>,
  next: NextFunction
) {
  try {
    const user = sessionUser(req.session);
    const lang = req.headers["accept-language"];
    let canvas_data;
    try {
      canvas_data = await get_canvas_rooms(user.kthid).catch(
        myCanvasRoomsApiErr
      );
    } catch (err) {
      log.error({ err, user }, "Failed to load canvas rooms");
    }
    const { programRooms = null } = canvas_data || {};

    res.send({ programRooms });
  } catch (err) {
    next(err);
  }
}

function myCanvasRoomsApiErr(err: any) {
  if (err.message.indexOf("401") > -1) {
    // We couldn't access Canvas, setting result to null
    return null;
  }
  handleCommonGotErrors(err);
  // TODO: Add API specific error handling
  Error.captureStackTrace(err, myCanvasRoomsApiErr);
  throw err;
}
