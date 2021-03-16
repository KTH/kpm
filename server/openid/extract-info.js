const log = require("skog");

const kopps = require("got").extend({
  prefixUrl: "https://api.kth.se/api/kopps/v2",
  responseType: "json",
});

async function lookupCourseData(courseCode) {
  try {
    const { body } = await kopps(`course/${courseCode}`);
    return {
      courseCode,
      name: body.title,
    };
  } catch (error) {
    log.error({ courseCode, error }, "Failed to get kopps info.");
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
