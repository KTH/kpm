import express, { NextFunction, Request, Response } from "express";
import CanvasClient, { CanvasRoom } from "./canvasApi";

export const api = express.Router();

api.get("/mine", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await do_getRooms(req, "self");
    res.send({ rooms: result });
  } catch (err) {
    next(err);
  }
});

api.get(
  "/user/:user",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await do_getRooms(req, `sis_user_id:${req.params.user}`);
      res.send({ rooms: result });
    } catch (err) {
      next(err);
    }
  }
);

async function do_getRooms(
  req: Request,
  user: string
): Promise<Record<string, Link[]>> {
  const canvas = new CanvasClient(req);
  const rooms = canvas.getRooms(user);

  let result: Record<string, Link[]> = {};
  try {
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
  } catch (e) {
    getRoomsErrorHandler(e);
  }
  return result;
}

function getRoomsErrorHandler(err: any) {
  // TODO: Add API specific error handling
  Error.captureStackTrace(err, getRoomsErrorHandler);
  throw err;
}

type Link = {
  url: URL;
  name: string;
  state: "unpublished" | "available" | "completed" | "deleted";
  text?: string;
  type: "course" | "exam" | "rapp" | undefined;
  startTerm?: string; // YYYYn (n = 1 | 2)
  examDate?: string; // YYYY-mm-dd
  registrationCode?: string; // Often a five-digit number, but may vary.
  favorite: boolean;
};

type TLinkMetaData = {
  type: Link["type"];
  name?: Link["name"];
  text?: Link["text"];
  startTerm?: Link["startTerm"];
  examDate?: Link["examDate"];
  registrationCode?: Link["registrationCode"];
};

type TGetRoomsReturnValue = {
  course_codes: Set<string>;
  link_meta_data: TLinkMetaData;
};

/*
  STARTED: Add
  - DONE: "typ": är denna länk kopplad med kursrum? tentarum? rapp? intern kurs?...
  - DONE: Termin/år (gäller endast kursrum)
  - DONE: Examinationsdatum, (gäller tentarum) (We currently don't parse exam rooms)
  - LATER: ~~Short name ("prosam18")~~
  - TODO: Add canvas favourite property
*/

export function get_rooms_courses_and_link(canvas_data: CanvasRoom) {
  const room_id = canvas_data.id;
  const link: Link = {
    url: new URL(`/courses/${room_id}`, process.env.CANVAS_API_URL),
    state: canvas_data.workflow_state,
    name: canvas_data.name,
    type: undefined,
    favorite: canvas_data.is_favorite,
  };

  const { course_codes, link_meta_data } =
    getRoomsByRapp(canvas_data) ||
    getRoomsByNewFormat(canvas_data) ||
    getRoomsByOldFormat(canvas_data) ||
    getExamRoomByNewFormat(canvas_data) ||
    getRoomsFallback(canvas_data);
  return {
    course_codes,
    link: {
      ...link,
      ...link_meta_data,
    },
  };
}

function getRoomsByRapp(
  canvas_data: CanvasRoom
): TGetRoomsReturnValue | undefined {
  const course_codes = new Set<string>();

  // Rapp courses may not be the most common or important, but we can
  // identify them based on only course name and ignore sections.
  const rapp = canvas_data.name.match(/^RAPP_([A-ZÅÄÖ0-9]{5,7}):/);
  if (rapp) {
    course_codes.add(rapp[1]);

    const link_meta_data: TLinkMetaData = {
      type: "rapp",
    };
    return { course_codes, link_meta_data };
  }
}

function getRoomsByNewFormat(
  canvas_data: CanvasRoom
): TGetRoomsReturnValue | undefined {
  const course_codes = new Set<string>();
  const link_meta_data: TLinkMetaData = {
    type: "course",
  };

  // Note; It would be nice if we got the sis id for the sections, but that
  // requires further API calls.
  const sections = canvas_data.sections.map((s) => s.name);

  const section_name_format =
    /^([A-ZÅÄÖ0-9]{5,7}) ([HV]T[0-9]{2,4}) \((\d+)\)/i;

  for (const section of sections) {
    const match = section.match(section_name_format);
    if (match) {
      const [_, courseCode, startTerm, registrationCode] = match;

      // logger.debug("Room %s Section %r match: %r", room_id, section, match[1])
      course_codes.add(courseCode);

      // INVESTIGATE: Which section determines startTerm? Right now last wins
      link_meta_data.startTerm = convertStartTerm(startTerm);
      link_meta_data.registrationCode = registrationCode;
    } else {
      // console.log(`Room ${room_id} Section "${section}" in "${canvas_data.name}"; no match.`)
    }
  }

  if (course_codes.size > 0) {
    return { course_codes, link_meta_data };
  }
}

function convertStartTerm(inp: string): Link["startTerm"] {
  let suffix = "";
  if (inp.startsWith("VT")) suffix = "1";
  if (inp.startsWith("HT")) suffix = "2";

  if (!suffix) {
    throw new Error('Unsupported term format "${inp}"');
  }

  let outp;
  const tmp = inp.slice(2);
  const tmpInt = parseInt(tmp);
  if (tmpInt < 70) {
    outp = `20${tmp}`;
  } else if (tmpInt < 100) {
    outp = `19${tmp}`;
  } else {
    outp = tmp;
  }

  return `${outp}${suffix}`;
}

function getRoomsByOldFormat(
  canvas_data: CanvasRoom
): TGetRoomsReturnValue | undefined {
  const course_codes = new Set<string>();

  // Note; It would be nice if we got the sis id for the sections, but that
  // requires further API calls.
  const sections = canvas_data.sections.map((s) => s.name);

  // Old SIS_COURSE_ID format for fallback handling
  const sis_course_id_format = /^(.*)([VH]T[0-9][0-9])([0-9A-Z])$/i;

  const sis_course_id = canvas_data.sis_course_id || "";
  //logger.info("Fallback for room %s %s (%s: %s).  Sections: %s",
  //  room_id, sis_course_id, canvas_data.get('course_code'),
  //  canvas_data.get('name'), sections)

  const match = sis_course_id.match(sis_course_id_format);
  // Note; The sections returned from the Canvas API are limited to those
  // where the current user is enrolled.
  if (match && sections.find((section) => section.includes(match[1]))) {
    const course_code = match[1];
    const link_meta_data: TLinkMetaData = {
      name: `${match[2]}-${match[3]}`,
      text: canvas_data.name,
      type: "course", // Always course for this function
    };
    // For now this function only return one (1) course code.
    // Could be improved by looking at the sections
    course_codes.add(course_code);

    return { course_codes, link_meta_data };
  }
}

function getExamRoomByNewFormat(
  canvas_data: CanvasRoom
): TGetRoomsReturnValue | undefined {
  const course_codes = new Set<string>();
  const link_meta_data: TLinkMetaData = {
    type: "exam",
  };

  // Note; It would be nice if we got the sis id for the sections, but that
  // requires further API calls.
  const sections = canvas_data.sections.map((s) => s.name);

  const nameRegex = /^([A-ZÅÄÖ0-9]{5,7}) (\w+) \[([0-9-]{10})\]/i;
  const sectionRegex = /^([A-ZÅÄÖ0-9]{5,7}) \w+ -/i;

  const matchName = canvas_data.name.match(nameRegex);
  if (!matchName) {
    // This is not an exam room AFAIK
    return undefined;
  }

  const courseCode = matchName[1];
  const examDate = matchName[3];

  course_codes.add(courseCode);
  link_meta_data.examDate = examDate;

  for (const section of sections) {
    const match = section.match(sectionRegex);
    if (match) {
      const courseCode = match[1];
      // logger.debug("Room %s Section %r match: %r", room_id, section, match[1])
      course_codes.add(courseCode);
    }
  }

  return { course_codes, link_meta_data };
}

function getRoomsFallback(canvas_data: CanvasRoom): TGetRoomsReturnValue {
  const course_codes = new Set<string>(["-"]); // The fallback can't determine course code

  // Note; It would be nice if we got the sis id for the sections, but that
  // requires further API calls.
  const sections = canvas_data.sections.map((s) => s.name);

  // Not a "correct" sis id or high likelihood of xlisting;
  // get some data to search for course codes.
  // logger.debug("Full canvas data: %r", canvas_data)
  const link_meta_data: TLinkMetaData = {
    name: canvas_data.name,
    text: `${canvas_data.course_code} ${sections.join(" ")}`,
    type: undefined, // We don't know what the type is at this poin,
  };

  return { course_codes, link_meta_data };
}
