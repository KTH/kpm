console.log("kpm: Starting kpm.js");

import { intl, addLanguageSelector } from "./translation";

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

function recreate() {
  document.getElementById("kpm").childNodes.forEach((node) => node.remove());
  kpm.innerHTML = `<div class="kpmbar">${intl("loading")}...</div>`;
  create();
}

async function create() {
  console.log("kpm: Load menu css");
  const style = import("./menu.css");
  console.log("kpm: Loaded menu css:", style);

  const content = await fetchPanel("");
  kpm.innerHTML = content;

  const loginButton = kpm.getElementsByClassName("kpm-login")[0];
  const openMenuButton = kpm.getElementsByClassName("kpm-open-menu")[0];

  if (loginButton) {
    loginButton.textContent = intl("login");
    const loginUrl = loginButton.getAttribute("href");

    loginButton.setAttribute(
      "href",
      `${loginUrl}?next=${window.encodeURIComponent(location.href)}`
    );
  }

  if (openMenuButton) {
    openMenuButton.textContent = intl("menu");
    openMenuButton.addEventListener("click", openMenu);
  }

  addLanguageSelector(recreate);

  const btn = document.getElementById("kpm-alert-btn");

  if (btn) {
    btn.addEventListener("click", (e) => {
      document.getElementById("kpm-alert").remove();
    });
  }

  await style;
}

async function start() {
  create();
}

async function openMenu(event) {
  kpm.classList.toggle("open");
  event.preventDefault();
  event.stopPropagation();
  kpm.querySelector(
    ".kpmpanel"
  ).innerHTML = `<p class="kpm-menu-loading">${intl("loading")}...</p>`;
  kpm.querySelector(".kpmpanel").innerHTML = await fetchPanel("hello");
}

async function fetchPanel(panel) {
  const url = new URL(`panels/${panel}`, scriptUrl);
  console.log("kpm: Fetch panel", panel, "from", url);
  const response = await window.fetch(url);
  if (response.status > 400) {
    console.error(`kpm: Error when fetching the "${panel}" panel: `, response);
  } else {
    return await response.text();
  }
}

start();
