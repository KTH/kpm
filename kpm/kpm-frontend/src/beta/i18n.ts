const langDictEn: Record<string, string> = {
  // TODO: Extract language strings
  Aktivera: "Activate",
  Avaktivera: "Deactivate",
  Anställd: "Staff",
  Alumn: "Alumni",
  Student: "Student",
  "International website": "KTH på svenska",
  Hem: "Home",
  Biblioteket: "Library",
  Utbildning: "Studies",
  Forskning: "Research",
  Samverkan: "Co-operation",
  "Om KTH": "About KTH",
  "Student på KTH": "Student at KTH",
  Alumni: "Alumni",
  "KTH Intranät": "KTH Intranet",
  Organisation: "Organisation",
  "KTH Biblioteket": "KTH Library",
  "KTH:s skolor": "KTH Schools",
  Rektor: "President",
  "Gemensamt verksamhetsstöd": "University Administration",
  Tjänster: "Services",
  Schema: "Timetables",
  "Kurs-, program- och gruppwebbar": "Course, programme and group webs",
  "Lärplattformen Canvas": "Learning management system (Canvas)",
  Webbmejl: "Webmail",
  Kontakt: "Contact",
  "Kontakta KTH": "Contact KTH",
  "Jobba på KTH": "Work at KTH",
  "Press och media": "Press and media",
  "Faktura och betalning": "Invoice and payment",
  "KTH på Facebook": "KTH on Facebook",
  "KTH på LinkedIn": "KTH on LinkedIn",
  "KTH på Twitter": "KTH on Twitter",
  "Kontakta webbansvarig": "Contact web site administrators",
  "Om KTH:s webbplats": "About KTH website",
  "Till sidans topp": "To page top",
  "sv-SE": "en-GB",
};

export function i18n(lang = "sv", key: string): string | undefined {
  if (lang === "sv") {
    return key;
  }
  return langDictEn[key];
}
