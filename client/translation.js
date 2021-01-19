//import Cookies from "js-cookie";

const translations = {
  en: {
    loading: "Loading",
    menu: "Menu",
    login: "Log in",
  },
  sv: {
    loading: "Laddar",
    menu: "Meny",
    login: "Logga in",
  },
};

const cookieOptions = {};

function setLang(lang) {
  // FIXME
  //return Cookies.set("kpm_lang", lang, cookieOptions);
}

function getLang() {
  // FIXME
  return 'SV';
  //return Cookies.get("kpm_lang").toLocaleUpperCase();
}

function setLanguage(recreate) {
  const currentLang = 'sv'; // Cookies.get("kpm_lang");
  if (currentLang === "sv") {
    setLang("en");
  } else {
    setLang("sv");
  }
  document.getElementById("kpm-lang-selector").textContent = getLang();
  recreate();
}

export function intl(input) {
  const lang = 'sv'; // Cookies.get("kpm_lang") || "sv";
  return translations[lang][input];
}

export function addLanguageSelector(recreate) {
  const langButton = document.createElement("button");
  langButton.id = "kpm-lang-selector";
  langButton.addEventListener("click", () => setLanguage(recreate));
  /*if (!Cookies.get("kpm_lang")) {
    Cookies.set("kpm_lang", "sv", cookieOptions);
  }*/
  langButton.textContent = getLang();
  document.getElementsByClassName("kpmbar")[0].appendChild(langButton);
}
