const kpm = document.createElement("nav");
kpm.id = "kpm";
kpm.innerHTML = '<div class="kpmbar">Loading...</div>';
document.body.insertBefore(kpm, document.body.firstChild);

async function start() {
  await import("./menu.css");
  const content = await fetchPanel("");
  kpm.innerHTML = content;

  const loginButton = kpm.getElementsByClassName("kpm-login")[0];
  const openMenuButton = kpm.getElementsByClassName("kpm-open-menu")[0];

  if (loginButton) {
    const loginUrl = loginButton.getAttribute("href");

    loginButton.setAttribute(
      "href",
      `${loginUrl}?next=${window.encodeURIComponent(location.href)}`
    );
  }

  if (openMenuButton) {
    openMenuButton.addEventListener("click", openMenu);
  }
}

async function openMenu(event) {
  kpm.classList.toggle("open");
  event.preventDefault();
  event.stopPropagation();
  kpm.querySelector(".kpmpanel").innerHTML = "<p>Loading...</p>";
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
