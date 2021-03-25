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

function parseUgGroup(name) {
  const LADOK_COURSE_PREFIX = /^ladok2\.kurser\.(\w+)\.(\w+)\.(.*)$/;
  const matchPrefix = LADOK_COURSE_PREFIX.exec(name);

  if (!matchPrefix) {
    return null;
  }

  const courseCode = `${matchPrefix[1]}${matchPrefix[2]}`;

  if (matchPrefix[3] === "godkand") {
    // This is a godkänd course, not a course round
    return {
      courseCode,
    };
  }

  const REGISTRERADE_SUFFIX = /^registrerade_(\d{4})(\d)\.(\w+)$/;
  const matchRegistered = REGISTRERADE_SUFFIX.exec(matchPrefix[3]);

  if (matchRegistered) {
    const yy = matchRegistered[1].slice(0, 2);
    const tt = matchRegistered[2] === "1" ? "HT" : "VT";

    return {
      sisId: `${courseCode}${tt}${yy}${matchRegistered[3]}`,
      courseCode,
      year: matchRegistered[1],
      term: matchRegistered[2],
      round: matchRegistered[3],
      status: "REGISTRERAD",
    };
  }

  // TODO: regex for antagna
}

function groupCourseRounds(courseRounds) {
  // 1. group "status"
  const groupedRounds = new Map();

  for (const round of courseRounds) {
    const existingRound = groupedRounds.get(round.sisId);

    if (existingRound) {
      existingRound.status.push(round.status);
    } else {
      groupedRounds.set(round.sisId, {
        ...round,
        status: [round.status],
      });
    }
  }

  // 2. group by courseCode
  const groupedCourses = new Map();

  for (const round of groupedRounds.values()) {
    const existingCourse = groupedCourses.get(round.courseCode);

    if (existingCourse) {
      existingCourse.courseRounds.push(round);
    } else {
      groupedCourses.set(round.courseCode, {
        courseCode: round.courseCode,
        courseRounds: [round],
      });
    }
  }

  return groupedCourses.values();
}

module.exports = async function extractInfoFromToken(token) {
  const completedStudentCourses = [];
  const activeStudentCourses = [];

  const parsedGroups = token.memberOf
    .map((groupName) => parseUgGroup(groupName))
    .filter((group) => group);

  const completedCourses = parsedGroups.filter(
    (group) => group.courseCode && !group.sisId
  );
  const activeCourseRounds = parsedGroups.filter(
    (group) => group.courseCode && group.sisId
  );
  const activeCourses = groupCourseRounds(activeCourseRounds);

  for (const course of completedCourses) {
    completedStudentCourses.push(await lookupCourseData(course.courseCode));
  }

  for (const course of activeCourses) {
    const courseData = await lookupCourseData(course.courseCode);
    courseData.courseRounds = [];

    for (const round of course.courseRounds) {
      const courseRoundData = {
        ...round,
        canvas: [],
      };
      courseData.courseRounds.push(courseRoundData);
    }

    activeStudentCourses.push(courseData);
  }

  log.info({ activeStudentCourses }, "Collected active courses");
  return {
    fullName: token.unique_name[0],
    completedStudentCourses,
    activeStudentCourses,
  };
};
