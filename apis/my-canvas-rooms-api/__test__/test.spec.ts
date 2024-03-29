import { describe, expect, test } from "@jest/globals";
import { get_rooms_courses_and_link } from "../src/api";

process.env.CANVAS_API_URL = "https://mock.kth.se/api/v1";

describe("Known room formats data can be parsed", () => {
  test("New Standard", () => {
    expect(
      // Mock data does not include favorites
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
          "favorite": undefined,
          "name": "SF1691 VT20 (60321) Komplex analys",
          "registrationCode": "60321",
          "startTerm": "20201",
          "state": "available",
          "type": "course",
          "url": "https://mock.kth.se/courses/17738",
        },
      }
    `);
  });

  test("examroom new format", () => {
    expect(
      // Mock data does not include favorites
      get_rooms_courses_and_link(
        JSON.parse(
          '{"id":39158,"name":"IE1206 TEN1 [2022-08-24] Salsexamination - omtentamen","account_id":113,"uuid":"HC0DgJySCl3bOtD7GUNLWYEIYdSgIqtIUmMWVLZ8","start_at":null,"grading_standard_id":null,"is_public":null,"created_at":"2022-06-25T00:38:51Z","course_code":"IE1206 TEN1 [2022-08-24] Salsexamination - omtentamen","default_view":"modules","root_account_id":1,"enrollment_term_id":1,"license":null,"grade_passback_setting":null,"end_at":null,"public_syllabus":false,"public_syllabus_to_auth":false,"storage_quota_mb":2000,"is_public_to_auth_users":false,"homeroom_course":false,"course_color":null,"friendly_name":null,"hide_final_grades":false,"apply_assignment_group_weights":false,"sections":[{"id":49798,"name":"IE1206 TEN1 - Section 2","start_at":null,"end_at":null},{"id":49797,"name":"IE1206 TEN1 - Section 1","start_at":null,"end_at":null}],"calendar":{"ics":"https://canvas.kth.se/feeds/calendars/course_HC0DgJySCl3bOtD7GUNLWYEIYdSgIqtIUmMWVLZ8.ics"},"time_zone":"Europe/Stockholm","blueprint":false,"template":false,"sis_course_id":"AKT.0008abc3-f2c5-11ec-a17f-ba4a8f01475d","sis_import_id":1294285,"integration_id":null,"enrollments":[],"workflow_state":"unpublished","restrict_enrollments_to_course_dates":false}'
        )
      )
    ).toMatchInlineSnapshot(`
      {
        "course_codes": Set {
          "IE1206",
        },
        "link": {
          "examDate": "2022-08-24",
          "favorite": undefined,
          "name": "IE1206 TEN1 [2022-08-24] Salsexamination - omtentamen",
          "state": "unpublished",
          "type": "exam",
          "url": "https://mock.kth.se/courses/39158",
        },
      }
    `);
  });

  test("examroom old format", () => {
    expect(
      // Mock data does not include favorites
      get_rooms_courses_and_link(
        JSON.parse(
          '{"id":30654,"name":"Tentamen för DD1362 TEN1/DD1361 TEN2: 2021-06-08","account_id":110,"uuid":"C7LVRFLspuGJqm25v43lQTT1mUGgHBNPedF20rlB","start_at":"2021-06-03T11:01:08Z","grading_standard_id":1371,"is_public":false,"created_at":"2021-05-11T06:54:04Z","course_code":"Tentamen för DD1362 TEN1/DD1361 TEN2: 2021-06-08","default_view":"wiki","root_account_id":1,"enrollment_term_id":1,"license":"private","grade_passback_setting":null,"end_at":null,"public_syllabus":false,"public_syllabus_to_auth":false,"storage_quota_mb":2000,"is_public_to_auth_users":false,"homeroom_course":false,"course_color":null,"friendly_name":null,"apply_assignment_group_weights":false,"sections":[{"id":37095,"name":"Omtentamen för DD1361 TEN2: 2021-06-08 - Section 1","start_at":null,"end_at":null,"enrollment_role":"TeacherEnrollment"},{"id":37097,"name":"Omtentamen för DD1361 TEN2: 2021-06-08 - Section 2","start_at":null,"end_at":null,"enrollment_role":"TeacherEnrollment"}],"is_favorite":false,"locale":"en","calendar":{"ics":"https://canvas.kth.se/feeds/calendars/course_C7LVRFLspuGJqm25v43lQTT1mUGgHBNPedF20rlB.ics"},"time_zone":"Europe/Stockholm","blueprint":false,"template":false,"sis_course_id":"AKT.7676a535-a655-11eb-863b-62bcffd242dd","sis_import_id":982240,"integration_id":null,"enrollments":[{"type":"teacher","role":"Examiner","role_id":10,"user_id":3342,"enrollment_state":"active","limit_privileges_to_course_section":false},{"type":"teacher","role":"Examiner","role_id":10,"user_id":3342,"enrollment_state":"active","limit_privileges_to_course_section":false}],"hide_final_grades":false,"workflow_state":"available","restrict_enrollments_to_course_dates":false,"overridden_course_visibility":""}'
        )
      )
    ).toMatchInlineSnapshot(`
      {
        "course_codes": Set {
          "DD1361",
        },
        "link": {
          "examDate": "2021-06-08",
          "favorite": false,
          "name": "Tentamen för DD1362 TEN1/DD1361 TEN2: 2021-06-08",
          "state": "available",
          "type": "exam",
          "url": "https://mock.kth.se/courses/30654",
        },
      }
    `);
  });

  test("examroom old format, double", () => {
    expect(
      // Mock data does not include favorites
      get_rooms_courses_and_link(
        JSON.parse(
          '{"id":33550,"name":"Kontrollskrivning för DD1331 KONT & DD1332 TEN2: 2021-12-09","account_id":110,"uuid":"vljm7fPBHu3sU0YLmVD5g9aCj9CHyffP0fRoPM0E","start_at":"2021-12-09T09:12:09Z","grading_standard_id":1371,"is_public":false,"created_at":"2021-10-10T00:38:19Z","course_code":"Kontrollskrivning för DD1331 KONT & DD1332 TEN2: 2021-12-09","default_view":"wiki","root_account_id":1,"enrollment_term_id":1,"license":"private","grade_passback_setting":null,"end_at":null,"public_syllabus":false,"public_syllabus_to_auth":false,"storage_quota_mb":2000,"is_public_to_auth_users":false,"homeroom_course":false,"course_color":null,"friendly_name":null,"apply_assignment_group_weights":false,"sections":[{"id":41180,"name":"Kontrollskrivning för DD1331 KONT & DD1332 TEN2: 2021-12-09 - Section 1","start_at":null,"end_at":null,"enrollment_role":"TeacherEnrollment"}],"is_favorite":false,"locale":"en-GB","calendar":{"ics":"https://canvas.kth.se/feeds/calendars/course_vljm7fPBHu3sU0YLmVD5g9aCj9CHyffP0fRoPM0E.ics"},"time_zone":"Europe/Stockholm","blueprint":false,"template":false,"sis_course_id":"AKT.2053eb53-2809-11ec-a60e-c0f64d1847cf","sis_import_id":1134241,"integration_id":null,"enrollments":[{"type":"teacher","role":"Examiner","role_id":10,"user_id":3342,"enrollment_state":"active","limit_privileges_to_course_section":false}],"hide_final_grades":false,"workflow_state":"available","restrict_enrollments_to_course_dates":false,"overridden_course_visibility":""}'
        )
      )
    ).toMatchInlineSnapshot(`
      {
        "course_codes": Set {
          "DD1331",
          "DD1332",
        },
        "link": {
          "examDate": "2021-12-09",
          "favorite": false,
          "name": "Kontrollskrivning för DD1331 KONT & DD1332 TEN2: 2021-12-09",
          "state": "available",
          "type": "exam",
          "url": "https://mock.kth.se/courses/33550",
        },
      }
    `);
  });

  test("examroom old format, swedish in name", () => {
    expect(
      // Mock data does not include favorites
      get_rooms_courses_and_link(
        JSON.parse(
          '{"id":29190,"name":"Extra examinationstillfälle för EI1110 TEN1: 2021-02-25","account_id":110,"uuid":"jSt8gaLkZ83sxSw6vHF4DR4w1mqHN3lyVOVV7KIO","start_at":null,"grading_standard_id":1371,"is_public":false,"created_at":"2021-02-03T11:58:00Z","course_code":"Extra examinationstillfälle för EI1110 TEN1: 2021-02-25","default_view":"wiki","root_account_id":1,"enrollment_term_id":1,"license":"private","grade_passback_setting":null,"end_at":null,"public_syllabus":false,"public_syllabus_to_auth":false,"storage_quota_mb":2000,"is_public_to_auth_users":false,"homeroom_course":false,"course_color":null,"friendly_name":null,"apply_assignment_group_weights":false,"sections":[{"id":34263,"name":"Extra examinationstillfälle för EI1110 TEN1: 2021-02-25 - Section 1","start_at":null,"end_at":null,"enrollment_role":"TeacherEnrollment"},{"id":34264,"name":"Extra examinationstillfälle för EI1110 TEN1: 2021-02-25 - Section 2","start_at":null,"end_at":null,"enrollment_role":"TeacherEnrollment"}],"is_favorite":false,"locale":"en","calendar":{"ics":"https://canvas.kth.se/feeds/calendars/course_jSt8gaLkZ83sxSw6vHF4DR4w1mqHN3lyVOVV7KIO.ics"},"time_zone":"Europe/Stockholm","blueprint":false,"template":false,"sis_course_id":"AKT.2debcff6-6614-11eb-8aa3-7ac7eafb4b13","sis_import_id":946452,"integration_id":null,"enrollments":[{"type":"teacher","role":"Examiner","role_id":10,"user_id":6001,"enrollment_state":"active","limit_privileges_to_course_section":false},{"type":"teacher","role":"Examiner","role_id":10,"user_id":6001,"enrollment_state":"active","limit_privileges_to_course_section":false}],"hide_final_grades":false,"workflow_state":"unpublished","restrict_enrollments_to_course_dates":false,"overridden_course_visibility":""}'
        )
      )
    ).toMatchInlineSnapshot(`
      {
        "course_codes": Set {
          "EI1110",
        },
        "link": {
          "examDate": "2021-02-25",
          "favorite": false,
          "name": "Extra examinationstillfälle för EI1110 TEN1: 2021-02-25",
          "state": "unpublished",
          "type": "exam",
          "url": "https://mock.kth.se/courses/29190",
        },
      }
    `);
  });
  test("examroom old format, room name fallback double", () => {
    expect(
      // Mock data does not include favorites
      get_rooms_courses_and_link(
        JSON.parse(
          '{"id":23554,"name":"EI2402 TEN1 & EI2402 PRO1: 2020-06-03","account_id":110,"uuid":"ppUEQ4VRvdSSWoIIlOgFiMZNvDDBAC3mWiaQtuve","start_at":"2020-05-29T13:05:04Z","grading_standard_id":null,"is_public":false,"created_at":"2020-05-07T14:55:26Z","course_code":"EI2402 TEN1 & EI2402 PRO1: 2020-06-03","default_view":"wiki","root_account_id":1,"enrollment_term_id":1,"license":"private","grade_passback_setting":null,"end_at":null,"public_syllabus":false,"public_syllabus_to_auth":false,"storage_quota_mb":2000,"is_public_to_auth_users":false,"homeroom_course":false,"course_color":null,"friendly_name":null,"apply_assignment_group_weights":false,"sections":[{"id":25615,"name":"Section 1","start_at":null,"end_at":null,"enrollment_role":"TeacherEnrollment"},{"id":25619,"name":"Section 2","start_at":null,"end_at":null,"enrollment_role":"TeacherEnrollment"}],"is_favorite":false,"locale":"en","calendar":{"ics":"https://canvas.kth.se/feeds/calendars/course_ppUEQ4VRvdSSWoIIlOgFiMZNvDDBAC3mWiaQtuve.ics"},"time_zone":"Europe/Stockholm","blueprint":false,"template":false,"sis_course_id":"AKT.3c7f10c7-9038-11ea-9c20-5fe648ca4e77.2020-06-03","sis_import_id":713579,"integration_id":null,"enrollments":[{"type":"teacher","role":"Examiner","role_id":10,"user_id":6001,"enrollment_state":"active","limit_privileges_to_course_section":false},{"type":"teacher","role":"Examiner","role_id":10,"user_id":6001,"enrollment_state":"active","limit_privileges_to_course_section":false}],"hide_final_grades":false,"workflow_state":"available","restrict_enrollments_to_course_dates":false,"overridden_course_visibility":""}'
        )
      )
    ).toMatchInlineSnapshot(`
      {
        "course_codes": Set {
          "EI2402",
        },
        "link": {
          "examDate": "2020-06-03",
          "favorite": false,
          "name": "EI2402 TEN1 & EI2402 PRO1: 2020-06-03",
          "state": "available",
          "type": "exam",
          "url": "https://mock.kth.se/courses/23554",
        },
      }
    `);
  });

  test("rapp", () => {
    expect(
      // Mock data does not include favorites
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
          "favorite": undefined,
          "name": "RAPP_DH1600:komm11 Kommunikation i ingenjörsvetenskap",
          "state": "unpublished",
          "type": "rapp",
          "url": "https://mock.kth.se/courses/15152",
        },
      }
    `);
  });

  test("Add startTerm to multi-section room DD1320/DD1325HT211", () => {
    // Input data from: https://canvas.kth.se/api/v1/courses/26987/?include[]=sections&include[]=favorites
    expect(
      get_rooms_courses_and_link(
        JSON.parse(
          '{"id":26987,"name":"DD1320/DD1325 HT21-1 Tillämpad datalogi","account_id":59,"uuid":"QFPpjrG9QUg6WsA6kkJYq7HWc3XJ8UQ7oAl6HgY6","start_at":"2021-08-06T07:46:46Z","grading_standard_id":null,"is_public":true,"created_at":"2020-12-15T06:40:39Z","course_code":"DD1320/DD1325HT211","default_view":"wiki","root_account_id":1,"enrollment_term_id":1,"license":"private","grade_passback_setting":null,"end_at":null,"public_syllabus":true,"public_syllabus_to_auth":false,"storage_quota_mb":2000,"is_public_to_auth_users":false,"homeroom_course":false,"course_color":null,"friendly_name":null,"hide_final_grades":true,"apply_assignment_group_weights":false,"sections":[{"id":39740,"name":"DD1320 HT21 (51218)","start_at":null,"end_at":null},{"id":40237,"name":"Extratid","start_at":null,"end_at":null},{"id":31632,"name":"DD1320 HT21 (52100)","start_at":null,"end_at":null},{"id":31636,"name":"DD1325 HT21 (50104)","start_at":null,"end_at":null}],"is_favorite":false,"locale":"sv","calendar":{"ics":"https://canvas.kth.se/feeds/calendars/course_QFPpjrG9QUg6WsA6kkJYq7HWc3XJ8UQ7oAl6HgY6.ics"},"time_zone":"Europe/Stockholm","blueprint":false,"template":false,"sis_course_id":"3a02aeca-3e1d-11eb-b960-5f936a674375","sis_import_id":1296229,"integration_id":null,"enrollments":[],"workflow_state":"available","restrict_enrollments_to_course_dates":true,"overridden_course_visibility":""}'
        )
      )
    ).toMatchInlineSnapshot(`
      {
        "course_codes": Set {
          "DD1320",
          "DD1325",
        },
        "link": {
          "favorite": false,
          "name": "DD1320/DD1325 HT21-1 Tillämpad datalogi",
          "registrationCode": "50104/51218/52100",
          "startTerm": "20212",
          "state": "available",
          "type": "course",
          "url": "https://mock.kth.se/courses/26987",
        },
      }
    `);
  });

  test("Add startTerm to multi-section room KH0022/KH0025 HT21/VT22", () => {
    // Input data from: https://canvas.kth.se/api/v1/courses/25670/?include[]=sections&include[]=favorites
    expect(
      get_rooms_courses_and_link(
        JSON.parse(
          '{"id":25670,"name":"KH0022/KH0025 HT21/VT22 Fysik för basår I","account_id":63,"uuid":"1TRUQFS1McIEmzTL07fF342UAaEgC7408a5jwObl","start_at":"2021-08-30T06:00:00Z","grading_standard_id":1371,"is_public":false,"created_at":"2020-11-10T13:04:20Z","course_code":"KH0022/KH0025 HT21/VT22","default_view":"wiki","root_account_id":1,"enrollment_term_id":1,"license":"private","grade_passback_setting":null,"end_at":"2022-08-30T22:00:00Z","public_syllabus":false,"public_syllabus_to_auth":false,"storage_quota_mb":2000,"is_public_to_auth_users":false,"homeroom_course":false,"course_color":null,"friendly_name":null,"hide_final_grades":true,"apply_assignment_group_weights":false,"sections":[{"id":29019,"name":"KH0022 HT21 (51732)","start_at":null,"end_at":null},{"id":40303,"name":"TbA","start_at":null,"end_at":null},{"id":40304,"name":"TbB","start_at":null,"end_at":null},{"id":40305,"name":"TbC","start_at":null,"end_at":null},{"id":40306,"name":"TbD","start_at":null,"end_at":null},{"id":40307,"name":"TbE","start_at":null,"end_at":null},{"id":38243,"name":"KH0025 VT22 (61340)","start_at":null,"end_at":null}],"is_favorite":false,"locale":"sv","calendar":{"ics":"https://canvas.kth.se/feeds/calendars/course_1TRUQFS1McIEmzTL07fF342UAaEgC7408a5jwObl.ics"},"time_zone":"Europe/Stockholm","blueprint":false,"template":false,"sis_course_id":"4c465aa8-2335-11eb-95d4-42ef0fda4885","sis_import_id":1296229,"integration_id":null,"enrollments":[],"workflow_state":"available","restrict_enrollments_to_course_dates":true}'
        )
      )
    ).toMatchInlineSnapshot(`
      {
        "course_codes": Set {
          "KH0022",
          "KH0025",
        },
        "link": {
          "favorite": false,
          "name": "KH0022/KH0025 HT21/VT22 Fysik för basår I",
          "registrationCode": "51732/61340",
          "startTerm": "20221",
          "state": "available",
          "type": "course",
          "url": "https://mock.kth.se/courses/25670",
        },
      }
    `);
  });
});

/*
  - Kursrum som har en sektion

  - Kursrum som har två sektioner (samläsningsrum)
    - en sektion är MH1001 VT22
    - en sektion är MH1002 HT22
    - exempel DD1320/DD1325HT211
      - https://canvas.kth.se/api/v1/courses/26987/
    - exempel KH0022/KH0025 HT21/VT22
      - https://canvas.kth.se/api/v1/courses/25670/
*/
