// import { fetchApi } from "./panes/utils";
import { authState, initSessionCheck } from "./state/authState";
import "./widget.scss";

const PORT = parseInt(process.env.PORT || "3000");
const PROXY_HOST = process.env.PROXY_HOST || `//localhost:${PORT}`;
const PROXY_PATH_PREFIX = process.env.PROXY_PATH_PREFIX || "/kpm";
const publicUriBase = `${PROXY_HOST}${PROXY_PATH_PREFIX}`;
const LOGIN_URL = `${publicUriBase}/auth/login`;

const STUDENT_REGEX1 = /^https?:\/\/student\.kth\.se/;
const STUDENT_REGEX2 = /^https?:\/\/(www\.)?kth.se\/student($|\/)/;
const EXTERNAL_REGEX = /^https?:\/\/(www\.)?kth.se\/(?!student($|\/))/;
const INTRA_REGEX = /^https?:\/\/intra\.kth\.se/;

const labels = {
  websites: {
    en: "Websites",
    sv: "Webbplatser",
  },
  login: {
    en: "Login",
    sv: "Logga in",
  },
};

const links = [
  {
    href: "https://kth.se",
    label: {
      en: "kth.se",
      sv: "kth.se",
    },
    test: (url: string) => EXTERNAL_REGEX.test(url),
  },
  {
    href: "https://kth.se/student",
    label: {
      en: "Student web",
      sv: "Studentwebben",
    },
    test: (url: string) => STUDENT_REGEX1.test(url) || STUDENT_REGEX2.test(url),
  },
  {
    href: "https://intra.kth.se",
    label: {
      en: "Intranet",
      sv: "Intranät",
    },
    test: (url: string) => INTRA_REGEX.test(url),
  },
];

function getPageLanguage() {
  const language = document.documentElement.lang;

  if (language.startsWith("sv")) {
    return "sv";
  } else {
    return "en";
  }
}

function loadKpm(user: any) {
  const wrapper = document.querySelector(".kth-kpm")!;
  const language = getPageLanguage();

  // Websites
  const container = document.createElement("div");
  container.className = "kth-kpm__container";

  const liElements = links
    .map((link) => {
      const current = link.test(window.location.toString())
        ? "aria-current='true'"
        : "";

      return `<li><a href=${link.href} ${current} class="kth-menu-item">${link.label[language]}</a></li>`;
    })
    .join("");

  const loginUrl = `${LOGIN_URL}?nextUrl=` + location.href;
  const loginLink = `<a class="kth-menu-item kpm-login" href=${loginUrl}>${labels.login[language]}</a>`;

  wrapper.innerHTML = `
    <div class="kth-kpm__container"><nav class="kth-entrances" aria-label="${labels.websites[language]}"><ul>${liElements}</ul></nav>${loginLink}</div>
  `;

  if (user) {
    // TODO
    console.log("THERE IS A USER");
  }
}

async function start() {
  if (!document.querySelector(".kth-kpm")) {
    // "old" kpm
    const container = document.createElement("div");
    container.id = "kpm-6cf53";
    container.style.position = "fixed";
    container.classList.add("kth-kpm");

    document.body.style.setProperty("--kpm-bar-height", "calc(2em + 1px)");
    document.body.classList.add("use-personal-menu");
    document.body.prepend(container);
  }

  loadKpm(authState.state("CurrentUser"));

  authState.subscribe(loadKpm);
  initSessionCheck();
}

start();
