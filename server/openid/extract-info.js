async function lookupCourseData(courseCode) {
  // TODO
  return { courseCode, name: { en: "TODO", sv: "ATTGÖRA" } };
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
