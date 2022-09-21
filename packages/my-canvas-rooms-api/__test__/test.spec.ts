import { describe, expect, test } from "@jest/globals";
import { get_rooms_courses_and_link } from "../src/api";

process.env.CANVAS_API_URL = "https://mock.kth.se/api/v1";

describe("New Standard format room data can be parsed", () => {
  test("one", () => {
    expect(
      get_rooms_courses_and_link(
        JSON.parse(
          '{ "id": 17738, "name": "SF1691 VT20 (60321) Komplex analys", "account_id": 28, "uuid": "sgE3QDxhYNAGDOeSbNcajUHGKrCohB708hzFjGx8", "start_at": "2020-03-16T06:00:00Z", "grading_standard_id": null, "is_public": true, "created_at": "2019-01-01T04:12:50Z", "course_code": "SF1691 VT20 (60321)", "default_view": "wiki", "root_account_id": 1, "enrollment_term_id": 1, "license": "private", "grade_passback_setting": null, "end_at": "2020-07-31T00:00:00Z", "public_syllabus": true, "public_syllabus_to_auth": true, "storage_quota_mb": 2000, "is_public_to_auth_users": false, "homeroom_course": false, "course_color": null, "friendly_name": null, "apply_assignment_group_weights": false, "sections": [{ "id": 15996, "name": "SF1691 VT20 (60321)", "start_at": null, "end_at": null, "enrollment_role": "TeacherEnrollment" }], "calendar": { "ics": "https://kth.test.instructure.com/feeds/calendars/course_sgE3QDxhYNAGDOeSbNcajUHGKrCohB708hzFjGx8.ics" }, "time_zone": "Europe/Stockholm", "blueprint": false, "template": false, "sis_course_id": "6cf72b24-f7bc-11e8-9614-d09e533d4323", "sis_import_id": 1291693, "integration_id": null, "enrollments": [{ "type": "teacher", "role": "Examiner", "role_id": 10, "user_id": 1426, "enrollment_state": "active", "limit_privileges_to_course_section": false }], "hide_final_grades": false, "workflow_state": "available", "restrict_enrollments_to_course_dates": true, "overridden_course_visibility": "" }'
        )
      )
    ).toMatchInlineSnapshot(`
      {
        "course_codes": Set {
          "SF1691",
        },
        "link": {
          "name": "SF1691 VT20 (60321) Komplex analys",
          "state": "available",
          "url": "https://mock.kth.se/courses/17738",
        },
      }
    `);
  });
});
