import express, { NextFunction, Request, Response } from "express";
import CanvasClient, { CanvasRoom, CanvasApiError } from "./canvasApi";
import log from "skog";
import { APIUserErrType, APIUser, Link } from "./interface";
import { EndpointError } from "kpm-api-common/src/errors";

export const api = express.Router();

api.get(
  "/mine",
  async (req: Request, res: Response<APIUser>, next: NextFunction) => {
    try {
      const result = await do_getRooms(req, "self");
      res.send(result);
    } catch (err) {
      next(err);
    }
  }
);

api.get(
  "/user/:user",
  async (req: Request, res: Response<APIUser>, next: NextFunction) => {
    try {
      const result = await do_getRooms(req, `sis_user_id:${req.params.user}`);
      res.send(result);
    } catch (err: any) {
      if (err?.name == "CanvasApiError" && err?.code == 404) {
        next(new UserMissingEndpointError({ err, sisUserId: req.params.user }));
      } else {
        next(err);
      }
    }
  }
);

class UserMissingEndpointError extends EndpointError<APIUserErrType> {
  constructor({ err, sisUserId }: { err: any; sisUserId: string }) {
    super({
      type: "NotFound",
      statusCode: 404,
      message: "User not found in Canvas.",
      details: { sisUserId },
      err,
    });
  }
}

async function do_getRooms(req: Request, user: string): Promise<APIUser> {
  const canvas = new CanvasClient(req);
  const rooms = canvas.getRooms(user);

  let courseRooms: Record<string, Link[]> = {};
  let programRooms: Record<string, Link> = {};
  let otherRooms: Link[] = [];

  try {
    for await (let room of rooms) {
      // Each canvas room may belong to multiple courses, and each
      // course usually has many canvas rooms.
      const tmpCourse = get_rooms_courses_and_link(room);
      if (tmpCourse) {
        const { course_codes, link } = tmpCourse;
        for (let code of course_codes) {
          if (courseRooms[code]) {
            courseRooms[code].push(link);
          } else {
            courseRooms[code] = [link];
          }
        }
      }

      const tmpProgram = get_program_rooms(room);
      if (tmpProgram) {
        const { program_code, link } = tmpProgram;
        if (programRooms[program_code]) {
          log.warn(
            `Duplicate program room for ${program_code}: ${programRooms[program_code]} and {link}`
          );
        } else {
          programRooms[program_code] = link;
        }
      }
      if (!tmpCourse && !tmpProgram) {
        otherRooms.push(room_link(room, getRoomsFallback(room)));
      }
    }
  } catch (err) {
    if (err instanceof CanvasApiError && err.code == 404) {
      // This is not an error, we just say ok, you have no canvas rooms.
      log.warn({ canvasUser: user }, "User not found in canvas; no rooms.");
    } else {
      Error.captureStackTrace(err as any);
      throw err;
    }
  }

  return { courseRooms, programRooms, otherRooms };
}

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
  const tmp =
    getRoomsByRapp(canvas_data) ||
    getRoomsByNewFormat(canvas_data) ||
    getRoomsByOldFormat(canvas_data) ||
    getExamRoomByNewFormat(canvas_data) ||
    getExamRoomByOldFormat(canvas_data) ||
    getRoomsByAltFormat(canvas_data);

  if (tmp === undefined) return undefined;

  const { course_codes, link_meta_data } = tmp;
  return {
    course_codes,
    link: room_link(canvas_data, link_meta_data),
  };
}

export function get_program_rooms(canvas_data: CanvasRoom) {
  // course_id,short_name,long_name,status,account_id
  // PROG.ARKIT,ARKIT,"ARKIT Programrum för Arkitektutbildning, 300.0 hp",active,PROGRAMME_ROOMS
  const isProgram = canvas_data.sis_course_id?.startsWith("PROG.");
  if (isProgram) {
    // What canvas calls `course_code` is really just a shortname.
    // For program rooms, we have populated that with the program code.
    return {
      program_code: canvas_data.course_code,
      link: room_link(canvas_data, { type: "program" }),
    };
  }
}

function room_link(canvas_data: CanvasRoom, extra: TLinkMetaData): Link {
  return {
    ...basic_link(canvas_data),
    ...extra,
  };
}

function basic_link(canvas_data: CanvasRoom): Link {
  return {
    url: new URL(`/courses/${canvas_data.id}`, process.env.CANVAS_API_URL),
    state: canvas_data.workflow_state,
    name: canvas_data.name,
    type: undefined,
    favorite: canvas_data.is_favorite,
  };
}

function getRoomsByRapp(
  canvas_data: CanvasRoom
): TGetRoomsReturnValue | undefined {
  const course_codes = new Set<string>();

  // Rapp courses may not be the most common or important, but we can
  // identify them based on only course name and ignore sections.
  const rapp = canvas_data.name.match(/^RAPP_([A-ZÅÄÖ0-9]{5,7}):/u);
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
    /^([A-ZÅÄÖ0-9]{5,7}) ([HV]T[0-9]{2,4}) \(([^\)]+)\)/iu;

  const regCodes: Set<string> = new Set();
  for (const section of sections) {
    const match = section.match(section_name_format);
    if (match) {
      const [_, courseCode, startTerm, registrationCode] = match;

      // logger.debug("Room %s Section %r match: %r", room_id, section, match[1])
      course_codes.add(courseCode);

      // INVESTIGATE: Which section determines startTerm? Right now last wins
      link_meta_data.startTerm = convertStartTerm(startTerm);
      regCodes.add(registrationCode);
    } else {
      // console.log(`Room ${canvas_data.id} Section "${section}" in "${canvas_data.name}"; no match.`)
    }
  }

  if (course_codes.size > 0) {
    if (regCodes.size) {
      link_meta_data.registrationCode = Array.from(regCodes).sort().join("/");
    }
    return { course_codes, link_meta_data };
  }
}

// The alt format are used by DD1390/91 / prosam.  Maybe more?
function getRoomsByAltFormat(
  canvas_data: CanvasRoom
): TGetRoomsReturnValue | undefined {
  const course_codes = new Set<string>();
  const link_meta_data: TLinkMetaData = {
    type: "course",
  };

  // Note; It would be nice if we got the sis id for the sections, but that
  // requires further API calls.
  const sections = canvas_data.sections.map((s) => s.name);

  const section_name_format_alt =
    /^([A-ZÅÄÖ0-9]{5,7}) ([a-z0-9]+) ([HV]T[0-9]{2,4})/iu;

  const regCodes: Set<string> = new Set();
  for (const section of sections) {
    const match = section.match(section_name_format_alt);
    if (match) {
      const [_, courseCode, registrationCode, startTerm] = match;

      // logger.debug("Room %s Section %r match: %r", room_id, section, match[1])
      course_codes.add(courseCode);

      // INVESTIGATE: Which section determines startTerm? Right now last wins
      link_meta_data.startTerm = convertStartTerm(startTerm);
      regCodes.add(registrationCode);
    } else {
      // console.log(`Room ${canvas_data.id} Section "${section}" in "${canvas_data.name}"; no match.`)
    }
  }

  if (course_codes.size > 0) {
    if (regCodes.size) {
      link_meta_data.registrationCode = Array.from(regCodes).sort().join("/");
    }
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

  const nameRegex = /^([A-ZÅÄÖ0-9]{5,7}) (\w+) \[([0-9-]{10})\]/iu;
  const sectionRegex = /^([A-ZÅÄÖ0-9]{5,7}) \w+ -/iu;

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

function getExamRoomByOldFormat(
  canvas_data: CanvasRoom
): TGetRoomsReturnValue | undefined {
  const course_codes = new Set<string>();
  const link_meta_data: TLinkMetaData = {
    type: "exam",
  };

  const sections = canvas_data.sections.map((s) => s.name);

  const sisidRegex = /^AKT\./;
  const sectionRegex =
    /^([\w åäö-]+ för )?([A-ZÅÄÖ0-9]{5,7}) \w+: ([0-9-]{10})( -.*)?/iu;
  const sectionDoubleRegex =
    /^(:?[\w åäö-]+ för) ([A-ZÅÄÖ0-9]{5,7}) \w+ . ([A-ZÅÄÖ0-9]{5,7}) \w+: ([0-9-]{10}) /iu;

  const matchName = canvas_data.sis_course_id?.match(sisidRegex);
  if (!matchName) {
    // This is not an exam room AFAIK
    return undefined;
  }
  //console.log("AKT room", canvas_data.id, ":", canvas_data.name)

  for (const section of sections) {
    const match = section.match(sectionRegex);
    if (match) {
      const [_whole, _ignore, courseCode, examDate] = match;
      course_codes.add(courseCode);
      link_meta_data.examDate = examDate;
    } else {
      const match = section.match(sectionDoubleRegex);
      if (match) {
        const [_whole, _ignore, courseCode1, courseCode2, examDate] = match;
        course_codes.add(courseCode1);
        course_codes.add(courseCode2);
        link_meta_data.examDate = examDate;
      }
    }
  }
  if (course_codes.size == 0) {
    const oldNameRegex = /^([A-ZÅÄÖ0-9]{5,7}) \w+: ([0-9-]{10})$/iu;
    const oldNameRegex2 =
      /^([A-ZÅÄÖ0-9]{5,7}) \w+ . ([A-ZÅÄÖ0-9]{5,7}) \w+: ([0-9-]{10})$/iu;
    const match = canvas_data.name.match(oldNameRegex);
    if (match) {
      const [_whole, courseCode, examDate] = match;
      course_codes.add(courseCode);
      link_meta_data.examDate = examDate;
    } else {
      const match2 = canvas_data.name.match(oldNameRegex2);
      if (match2) {
        const [_whole, courseCode, courseCode2, examDate] = match2;
        course_codes.add(courseCode);
        course_codes.add(courseCode2);
        link_meta_data.examDate = examDate;
      }
    }
  }
  if (course_codes.size > 0) {
    return { course_codes, link_meta_data };
  }
}

function getRoomsFallback(canvas_data: CanvasRoom): TLinkMetaData {
  const sections = canvas_data.sections.map((s) => s.name);

  // No known kind of room, log some details in case it is something
  // we _should_ recognize.
  log.info(
    {
      room_id: canvas_data.id,
      room_name: canvas_data.name,
      sis_corse_id: canvas_data.sis_course_id,
      sections,
    },
    "Unmatched canvas room"
  );

  return {
    text: `${canvas_data.course_code} ${sections.join(" ")}`,
    type: undefined, // We don't know what the type is at this point,
  };
}
