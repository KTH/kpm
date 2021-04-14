import { intl, addLanguageSelector } from "./translation";
import { toggleMenu } from "./toggle-menu";

import * as Components from "./components";

console.log("kpm: Starting kpm.js");

console.log("kpm: Imported translation");

// Note: src is the resolved url, not the raw attribute
const scriptUrl = (
  document.currentScript || document.querySelector("script[src$='/kpm.js']")
).src;

console.log("kpm: Script url is", scriptUrl);

const kpm = document.createElement("nav");
kpm.id = "kpm";
kpm.innerHTML = `<div class="kpmbar">${intl("loading")}...</div>`;
document.body.insertBefore(kpm, document.body.firstChild);

async function fetchPanel(panel) {
  const url = new URL(`panels/${panel}`, scriptUrl);
  console.log("kpm: Fetch panel", panel, "from", url);
  const response = await window.fetch(url, {
    mode: "cors",
    credentials: "include",
  });
  if (response.status > 400) {
    console.error(`kpm: Error when fetching the "${panel}" panel: `, response);
  }
  return response.text();
}

async function openMenu(event) {
  const menuName = event.target.dataset.name;
  kpm.classList.toggle("open");
  event.preventDefault();
  event.stopPropagation();
  kpm.querySelector(
    ".kpmpanel"
  ).innerHTML = `<p class="kpm-menu-loading">${intl("loading")}...</p>`;
  kpm.querySelector(".kpmpanel").innerHTML = await fetchPanel(menuName);

  for (const t of document.getElementsByClassName("tabs")) {
    Components.tabGroup(t);
  }
}

async function create() {
  console.log("kpm: Load menu css");
  const style = import("./scss/main.scss");
  console.log("kpm: Loaded menu css:", style);

  const content = await fetchPanel("");
  kpm.innerHTML = content;

  const loginButton = kpm.getElementsByClassName("kpm-login")[0];
  const openMenuButton = kpm.getElementsByClassName("kpm-open-menu");

  if (loginButton) {
    loginButton.textContent = intl("login");
    const loginUrl = loginButton.getAttribute("href");

    loginButton.setAttribute(
      "href",
      `${loginUrl}?next=${window.encodeURIComponent(window.location.href)}`
    );
  }

  for (const panel of openMenuButton) {
    panel.addEventListener("click", openMenu);
  }

  /* eslint-disable no-use-before-define */
  addLanguageSelector(recreate);

  const btn = document.getElementById("kpm-alert-btn");

  if (btn) {
    btn.addEventListener("click", () => {
      document.getElementById("kpm-alert").remove();
    });
  }

  await style;
}

function recreate() {
  document.getElementById("kpm").childNodes.forEach((node) => node.remove());
  kpm.innerHTML = `<div class="kpmbar">${intl("loading")}...</div>`;
  create();
}
async function start() {
  create();
  toggleMenu();
}

start();
