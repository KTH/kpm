const intl = require("./translation");

const kpm = document.createElement("nav");
kpm.id = "kpm";
kpm.innerHTML = `<div class="kpmbar">${intl("loading", "sv")}...</div>`;
document.body.insertBefore(kpm, document.body.firstChild);

function setLanguage() {}

async function start() {
  await import("./menu.css");
  const content = await fetchPanel("");
  kpm.innerHTML = content;

  const loginButton = kpm.getElementsByClassName("kpm-login")[0];
  const openMenuButton = kpm.getElementsByClassName("kpm-open-menu")[0];

  if (loginButton) {
    loginButton.textContent = intl("login", "sv");
    const loginUrl = loginButton.getAttribute("href");

    loginButton.setAttribute(
      "href",
      `${loginUrl}?next=${window.encodeURIComponent(location.href)}`
    );
  }

  if (openMenuButton) {
    openMenuButton.textContent = intl("menu", "sv");
    openMenuButton.addEventListener("click", openMenu);
  }

  const btn = document.getElementById("kpm-alert-btn");
  btn.addEventListener("click", (e) => {
    document.getElementById("kpm-alert").remove();
  });
}

async function openMenu(event) {
  kpm.classList.toggle("open");
  event.preventDefault();
  event.stopPropagation();
  kpm.querySelector(
    ".kpmpanel"
  ).innerHTML = `<p class="kpm-menu-loading">${intl("loading", "sv")}...</p>`;
  kpm.querySelector(".kpmpanel").innerHTML = await fetchPanel("hello");
}

async function fetchPanel(panel) {
  const response = await window.fetch(
    `${process.env.SERVER_HOST_URL}/kpm/panels/${panel}`
  );
  if (response.status > 400) {
    console.error(`Error when fetching the "${panel}" panel: `, response);
  } else {
    return await response.text();
  }
}

start();
