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

module.exports = async function extractInfoFromToken(token) {
  const completedStudentCourses = [];
  const activeStudentCourses = []; // TODO
  const COMPLETED_COURSE_REGEX = /^ladok2\.kurser\.(\w+)\.(\w+)\.godkand$/;

  for (const group of token.memberOf) {
    const match = COMPLETED_COURSE_REGEX.exec(group);

    if (match) {
      const courseCode = `${match[1]}${match[2]}`;
      const courseData = await lookupCourseData(courseCode);
      completedStudentCourses.push(courseData);
    }
  }

  return {
    fullName: token.unique_name[0],
    completedStudentCourses,
    activeStudentCourses,
  };
};
