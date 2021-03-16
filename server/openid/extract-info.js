const log = require("skog");
const redis = require("redis").createClient();

const kopps = require("got").extend({
  prefixUrl: "https://api.kth.se/api/kopps/v2",
  responseType: "json",
});

const { promisify } = require("util");
const cache = {
  get: promisify(redis.get).bind(redis),
  set: promisify(redis.set).bind(redis),
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
    await cache.set(key, JSON.stringify(data));
    return data;
  } catch (error) {
    log.error({ courseCode, err: error }, "Failed to get kopps info.");
    return { courseCode, name: { en: "-", sv: "-" } };
  }
}

module.exports = async function extractInfoFromToken(token) {
  const completedCourses = [];
  const COMPLETED_COURSE_REGEX = /^ladok2\.kurser\.(\w+)\.(\w+)\.godkand$/;

  for (const group of token.memberOf) {
    const match = COMPLETED_COURSE_REGEX.exec(group);

    if (match) {
      const courseCode = `${match[1]}${match[2]}`;
      const courseData = await lookupCourseData(courseCode);
      completedCourses.push(courseData);
    }
  }

  return {
    fullName: token.unique_name[0],
    completedCourses,
  };
};
