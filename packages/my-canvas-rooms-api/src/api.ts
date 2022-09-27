/* Top-level source file for my-canvas-rooms-api */
import express, { Request, Response } from "express";
import CanvasClient, { CanvasRoom } from "./canvasApi";

export const api = express.Router();

api.get("/", (_req, res) => {
  res.send({ msg: "Hello World!!!" });
});
api.get("/_monitor", (_req, res) => {
  res.send("APPLICATION_STATUS: Ok");
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

type Link = {
  url: URL,
  name: string,
  state: "unpublished" | "available" | "completed" | "deleted",
  text?: string,
  type: "course" | "rapp" | undefined,
};

type TLinkMetaData = {
  type: Link["type"],
  name?: Link["name"],
  text?: Link["text"],
}

type TGetRoomsReturnValue = {
  course_codes: Set<string>,
  link_meta_data: TLinkMetaData
}


/*
  TODO: Add
  - "typ": är denna länk kopplad med kursrum? tentarum? rapp? intern kurs?...
  - Termin/år (gäller endast kursrum)
  - Roll: lärare? student? examinator?
  - ~~Short name ("prosam18")~~
  - Examinationsdatum, (gäller tentarum)
*/

export function get_rooms_courses_and_link(canvas_data: CanvasRoom) {
  const room_id = canvas_data.id;
  const link: Link = {
    'url': new URL(`/courses/${room_id}`, process.env.CANVAS_API_URL),
    'state': canvas_data.workflow_state,
    'name': canvas_data.name,
    'type': undefined,
  }

  const { course_codes, link_meta_data } = getRoomsByRapp(canvas_data) || getRoomsByNewFormat(canvas_data) || getRoomsByOldFormat(canvas_data);
  return {
    course_codes,
    link: {
      ...link,
      ...link_meta_data
    }
  };
}



function getRoomsByRapp(canvas_data: CanvasRoom) : TGetRoomsReturnValue | undefined {
  const course_codes = new Set<string>();

    // Rapp courses may not be the most common or important, but we can
  // identify them based on only course name and ignore sections.
  const rapp = canvas_data.name.match(/^RAPP_([A-ZÅÄÖ0-9]{5,7}):/);
  if (rapp) {
    course_codes.add(rapp[1]);
    
    const link_meta_data: TLinkMetaData = {
      type: "rapp"
    };
    return { course_codes, link_meta_data };
  }
}

function getRoomsByNewFormat(canvas_data: CanvasRoom) : TGetRoomsReturnValue | undefined {
  const course_codes = new Set<string>();

  // Note; It would be nice if we got the sis id for the sections, but that
  // requires further API calls.
  const sections = canvas_data.sections.map(s => s.name);

  const section_name_format = /([A-ZÅÄÖ0-9]{5,7}) [HV]T[0-9]{2,4} \(\d+\)/i;

  for (const section of sections) {
    const match = section.match(section_name_format);
    if (match) {
      // logger.debug("Room %s Section %r match: %r", room_id, section, match[1])
      course_codes.add(match[1])
    } else {
      // console.log(`Room ${room_id} Section "${section}" in "${canvas_data.name}"; no match.`)
    }
  }

  if (course_codes.size > 0) {
    const link_meta_data: TLinkMetaData = {
      type: "course"
    };

    return { course_codes, link_meta_data };
  }
}


function getRoomsByOldFormat(canvas_data: CanvasRoom) : TGetRoomsReturnValue {
  const course_codes = new Set<string>();
  const link_meta_data: TLinkMetaData = {
    name: "",
    text: "",
    type: "course" // INVESTIGATE: Can we assume that rooms that hit this function are of type course?
  };

  // Note; It would be nice if we got the sis id for the sections, but that
  // requires further API calls.
  const sections = canvas_data.sections.map(s => s.name);


  // Old SIS_COURSE_ID format for fallback handling
  const sis_course_id_format = /^(.*)([VH]T[0-9][0-9])([0-9A-Z])$/i;

  const sis_course_id = canvas_data.sis_course_id || '';
  //logger.info("Fallback for room %s %s (%s: %s).  Sections: %s",
  //  room_id, sis_course_id, canvas_data.get('course_code'),
  //  canvas_data.get('name'), sections)

  const match = sis_course_id.match(sis_course_id_format);
  // Note; The sections returned from the Canvas API are limited to those
  // where the current user is enrolled.
  let course_code = '-';
  if (match && sections.find((section) => section.includes(match[1]))) {
    course_code = match[1];
    link_meta_data.name = `${match[2]}-${match[3]}`;
    link_meta_data.text = canvas_data.name;
  } else {
    // Not a "correct" sis id or high likelihood of xlisting;
    // get some data to search for course codes.
    // logger.debug("Full canvas data: %r", canvas_data)
    link_meta_data.name = canvas_data.name;
    link_meta_data.text = `${canvas_data.course_code} ${sections.join(' ')}`;
  }

  // INVESTIGATE: Should this function only return one (1) course code?
  course_codes.add(course_code);

  return { course_codes, link_meta_data }
}
