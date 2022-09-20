/* Top-level source file for my-canvas-rooms-api */
import { config } from "dotenv";
config();

import express, { Request, Response } from "express";
import CanvasClient, { CanvasRoom } from "./canvasApi";

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

api.get("/user/:user", async (req, res, next) => {

  try {
    const canvas = new CanvasClient(req);
    const rooms = canvas.getRooms(`sis_user_id:${req.params.user}`);
    let result: { [index: string]: Array<Link> } = {};
    for await (let room of rooms) {
      // Each canvas room may belong to multiple courses, and each
      // course usually has many canvas rooms.
      let { course_codes, link } = get_rooms_courses_and_link(room);
      for (let code of course_codes) {
        if (result[code]) {
          result[code].push(link);
        } else {
          result[code] = [link];
        }
      }
    }
    res.send({ rooms: result });
  } catch (err) {
    next(err);
  }
});

app.use((req, res, next) => {
  next();
  console.log(`${req.path} => ${res.statusCode}`);
});
app.use(prefix, api);
app.use((err: Error, req: Request, res: Response, next: any) => {
  res.status(500).send();
  console.log(`${req.path} => ${err}`);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

function get_rooms_courses_and_link(canvas_data: CanvasRoom) {
  const room_id = canvas_data.id;
  const link = {
    'url': new URL(`/courses/${room_id}`, process.env.CANVAS_API_URL),
    'state': canvas_data.workflow_state,
    'name': canvas_data.name,
  }
  // Note; It would be nice if we got the sis id for the sections, but that
  // requires further API calls.
  const sections = canvas_data.sections.map(s => s.name);


  const section_name_format = /([A-ZÅÄÖ0-9]{5,7}) [HV]T[0-9]{2,4} \(\d+\)/i;

  const course_codes = new Set<string>()
  for (const section of sections) {
    const match = section.match(section_name_format);
    if (match) {
      // logger.debug("Room %s Section %r match: %r", room_id, section, match[1])
      course_codes.add(match[1])
    } else {
      // logger.debug("Room %s Section %r; no match.", room_id, section)
    }
  }
  if (course_codes.size > 0) {
    return { course_codes, link }
  }

  return { course_codes, link }
  /* FIXME: Handle old format, something like this:
  // Old SIS_COURSE_ID format for fallback handling
  const sis_course_id_format = /^(.*)([VH]T[0-9][0-9])([0-9A-Z])$/i;

  sis_course_id = canvas_data.get('sis_course_id') or ''
  logger.info("Fallback for room %s %s (%s: %s).  Sections: %s",
    room_id, sis_course_id, canvas_data.get('course_code'),
    canvas_data.get('name'), sections)

  match = sis_course_id_format.match(sis_course_id)
    # Note; The sections returned from the Canvas API are limited to those
    # where the current user is enrolled.
    course_code = match.group(1) if match and any(
      match.group(1) in section for section in sections) else '-'
  if course_code != '-':
    result['text'] = match.group(2) + '-' + match.group(3)
  result['name'] = canvas_data.get('name')
    else:
        # Not a "correct" sis id or high likelihood of xlisting;
        # get some data to search for course codes.
    logger.debug("Full canvas data: %r", canvas_data)
        result['text'] = canvas_data.get('name')
        result['name'] = canvas_data.get('course_code') + ' ' + ' '.join(sections)
  return set([course_code]), result
  */
}

type Link = {
  url: URL,
  name: string,
  state: "unpublished" | "available" | "completed" | "deleted";
};
