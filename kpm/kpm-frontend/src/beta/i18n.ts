const langDictEn: Record<string, string> = {
  // TODO: Extract language strings
  Aktivera: "Activate",
  Avaktivera: "Deactivate",
  Anställd: "Employee",
  Alumn: "Alumn",
  Student: "Student",
  Hem: "Home",
  Biblioteket: "Library",
  Utbildning: "Education",
  Forskning: "Research",
  Samverkan: "Collaboration",
  "Om KTH": "About KTH",
  "Student på KTH": "Student at KTH",
  Alumni: "Alumni",
  "KTH Intranät": "KTH Intranet",
  Organisation: "Organisation",
  "KTH Biblioteket": "KTH Library",
  "KTH:s skolor": "KTH's schools",
  Rektor: "Principal",
  "Gemensamt verksamhetsstöd": "Common operational support",
  Tjänster: "Services",
  Schema: "Schedule",
  "Kurs-, program- och gruppwebbar": "Course, program and group websites",
  "Lärplattformen Canvas": "Learning platform Canvas",
  Webbmejl: "Webmail",
  Kontakt: "Contact",
  "Kontakta KTH": "Contact KTH",
  "Jobba på KTH": "Work at KTH",
  "Press och media": "Press and media",
  "Faktura och betalning": "Invoice and payment",
  "KTH på Facebook": "KTH on Facebook",
  "KTH på LinkedIn": "KTH on LinkedIn",
  "KTH på Twitter": "KTH on Twitter",
  "Kontakta webbansvarig": "Contact webmaster",
  "Om KTH:s webbplats": "About KTH's website",
  "Till sidans topp": "To page top",
  "sv-SE": "en-SE",
};

export function i18n(lang = "sv", key: string): string | undefined {
  if (lang === "sv") {
    return key;
  }
  return langDictEn[key];
}
