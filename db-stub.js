module.exports = {
  u1znmoik: {
    kthid: "u1znmoik",
    givenName: "Emil",
    surName: "Stenberg",
    
    completedStudentCourses: [
      {
        courseCode: "SF1624",
        name: {
          sv: "Jättematematik-kursen!",
          en: "A giant math course",
        },
        coursePMLink: "http://www.example.com",
      },{
        courseCode: "A11IAA",
        name: {
          sv: "Introduktion till Arkitekturämnet",
          en: "Introduction to the Discipline of Architecture",
        },
        coursePMLink: "http://www.example.com",
      },

    ],

    activeStudentCourses: [
      {
        courseCode: "A11IAA",
        status: ['ANTAGEN', 'REGISTRERAD'],
        name: {
          sv: "Introduktion till Arkitekturämnet",
          en: "Introduction to the Discipline of Architecture",
        },
        coursePMLink: "http://www.example.com",
        courseRounds: [
          {
            startYear: "2020",
            startTerm: "HT",
            roundId: 1,
            ladok_uid: "cdca7048-0b8a-11ea-b635-76a5f35c4a62",
            canvasLink: "https://canvas.kth.se/courses/19784",
          },
        ],
      },
    ],
  },
};
