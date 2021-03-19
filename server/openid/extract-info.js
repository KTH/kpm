const log = require("skog");
const redis = require("redis").createClient({
  url: process.env.REDIS_URL,
});

// Note about the kopps timeout: For most courses we get our reply in
// less than 200 ms but some (e.g. SF1624) gives a timeout even at 500
// ms.  But since that is the rare case and we cache the results in
// redis, just increase the timeout to 2 whole seconds.
const kopps = require("got").extend({
  prefixUrl: "https://api.kth.se/api/kopps/v2",
  responseType: "json",
  timeout: 2000, // milliseconds
});

const { promisify } = require("util");
const cache = {
  get: promisify(redis.get).bind(redis),
  set: promisify(redis.set).bind(redis),
  expire: 61 * 60 * 24, // slightly more than 24 hours.
};

async function lookupCourseData(courseCode) {
  try {
    const key = `course/${courseCode}`;
    const cached = await cache.get(key);
    if (cached) {
      log.debug({ cached }, "Kopps from redis");
      return JSON.parse(cached);
    }
    log.info({ courseCode }, "Should get course data from kopps");
    const { body } = await kopps(key);
    const data = {
      courseCode,
      name: body.title,
    };
    await cache.set(key, JSON.stringify(data), "EX", cache.expire);
    return data;
  } catch (error) {
    log.error({ courseCode, err: error }, "Failed to get kopps info.");
    // Mock some empty data, so the panel doesn't 500 and the course code
    // and other names are still visible.
    return { courseCode, name: { en: "-", sv: "-" } };
  }
}

function addActive(buildActive, { courseCode, year, term, round, status }) {
  log.info({ courseCode, year, term, round }, "Registrerad");
  const roundStr = `${year}-${term}-${round || "x"}`;
  let course;
  if (buildActive.has(courseCode)) {
    course = buildActive.get(courseCode);
  } else {
    course = new Map();
    buildActive.set(courseCode, course);
  }
  if (course.has(roundStr)) {
    course.get(roundStr).status.add(status);
  } else {
    course.set(roundStr, {
      status: new Set([status]),
      startYear: year,
      startTerm: term,
      roundId: round,
    });
  }
}

module.exports = async function extractInfoFromToken(token) {
  const completedStudentCourses = [];
  const buildActive = new Map();
  const LADOK_COURSE_REGEX = /^ladok2\.kurser\.(\w+)\.(\w+)\.(.*)$/;
  const REG_ROUND_REGEX = /^registrerade_(\d{4})(\d)\.(\w+)$/;
  // Note: I'm not sure we should look at REG_TERM_REGEX at all.
  // The relevant groups should have course rounds.
  const REG_TERM_REGEX = /^(om)?registrerade_(\d{4})(\d)$/;
  for (const group of token.memberOf) {
    const match = LADOK_COURSE_REGEX.exec(group);
    if (match) {
      const courseCode = `${match[1]}${match[2]}`;
      if (match[3] == "godkand") {
        const courseData = await lookupCourseData(courseCode);
        completedStudentCourses.push(courseData);
      } else {
        const regmatch = REG_ROUND_REGEX.exec(match[3]);
        if (regmatch) {
          addActive(buildActive, {
            courseCode,
            year: regmatch[1],
            term: regmatch[2],
            round: regmatch[3],
            status: "REGISTRERAD",
          });
        } else {
          const regmatch = REG_TERM_REGEX.exec(match[3]);
          if (regmatch) {
            addActive(buildActive, {
              courseCode,
              year: regmatch[2],
              term: regmatch[3],
              status: "REGISTRERAD",
            });
          } else {
            log.info({ courseCode, sub: match[3] }, "TODO");
          }
        }
      }
    }
  }

  const activeStudentCourses = [];
  for (const [courseCode, data] of buildActive) {
    const courseData = await lookupCourseData(courseCode);
    courseData.courseRounds = [...data.values()].map((value) => {
      const t = {
        status: [...value.status],
        startYear: value.startYear,
        startTerm: value.startTerm,
        roundId: value.roundId,
        canvas: [], // TODO?
      };
      return t;
    });
    activeStudentCourses.push(courseData);
  }
  log.info({ activeStudentCourses }, "Collected active courses");
  return {
    fullName: token.unique_name[0],
    completedStudentCourses,
    activeStudentCourses,
  };
};
