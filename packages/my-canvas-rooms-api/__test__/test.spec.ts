import { describe, expect, test } from "@jest/globals";
import { get_rooms_courses_and_link } from "../src/api";

process.env.CANVAS_API_URL = "https://mock.kth.se/api/v1";

describe("Known room formats data can be parsed", () => {
  test("New Standard", () => {
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
          "type": "course",
          "url": "https://mock.kth.se/courses/17738",
        },
      }
    `);
  });

  test("rapp", () => {
    expect(
      get_rooms_courses_and_link(
        JSON.parse(
          '{"id":15152,"name":"RAPP_DH1600:komm11 Kommunikation i ingenjörsvetenskap","account_id":56,"uuid":"OhRYeqg2zQDIeVlQPZEuSpHKgeqQycqEesop7Kjp","start_at":"2010-09-01T22:00:00Z","grading_standard_id":null,"is_public":null,"created_at":"2018-12-11T10:41:48Z","course_code":"DH1600","default_view":"modules","root_account_id":1,"enrollment_term_id":1,"license":null,"grade_passback_setting":null,"end_at":"2021-01-01T00:00:00Z","public_syllabus":false,"public_syllabus_to_auth":false,"storage_quota_mb":2000,"is_public_to_auth_users":false,"homeroom_course":false,"course_color":null,"friendly_name":null,"apply_assignment_group_weights":false,"sections":[{"id":12712,"name":"Section for the course RAPP_DH1600:komm11","start_at":null,"end_at":null,"enrollment_role":"TeacherEnrollment"}],"calendar":{"ics":"https://kth.test.instructure.com/feeds/calendars/course_OhRYeqg2zQDIeVlQPZEuSpHKgeqQycqEesop7Kjp.ics"},"time_zone":"Europe/Stockholm","blueprint":false,"template":false,"sis_course_id":"RAPP_DH1600:komm11","sis_import_id":986064,"integration_id":null,"enrollments":[{"type":"teacher","role":"TeacherEnrollment","role_id":4,"user_id":97,"enrollment_state":"active","limit_privileges_to_course_section":false}],"hide_final_grades":false,"workflow_state":"unpublished","restrict_enrollments_to_course_dates":true}'
        )
      )
    ).toMatchInlineSnapshot(`
      {
        "course_codes": Set {
          "DH1600",
        },
        "link": {
          "name": "RAPP_DH1600:komm11 Kommunikation i ingenjörsvetenskap",
          "state": "unpublished",
          "type": "rapp",
          "url": "https://mock.kth.se/courses/15152",
        },
      }
    `);
  });
});
