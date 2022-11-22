import { Request, Response, NextFunction } from "express";
import { EndpointError } from "kpm-api-common/src/errors";
import { APICanvasRooms, TAPICanvasRoomsApiEndpointError } from "kpm-backend-interface";
import { get_canvas_rooms, sessionUser } from "./common";
import { handleCommonGotErrors } from "./commonErrors";

export async function canvasRoomsApiHandler(req: Request, res: Response<APICanvasRooms>, next: NextFunction) {
  try {
    const user = sessionUser(req.session);
    const { rooms } = await get_canvas_rooms(user.kthid).catch(getApiCanvasRoomsErrorHandler) || {};
    res.send({ rooms: rooms || {} });
  } catch (err) {
    next(err);
  }
}

class CanvasRoomsApiEndpointError extends EndpointError<TAPICanvasRoomsApiEndpointError> {}
function getApiCanvasRoomsErrorHandler(err: any) {
  handleCommonGotErrors("Canvas Rooms API", err, (props: any) => new CanvasRoomsApiEndpointError(props));
  
  Error.captureStackTrace(err, getApiCanvasRoomsErrorHandler);
  throw err;
}
