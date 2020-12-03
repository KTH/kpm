const kpm = document.createElement("nav");
kpm.id = "kpm";
kpm.innerHTML = '<div class="kpmbar">Loading...</div>';
document.body.insertBefore(kpm, document.body.firstChild);

async function start() {
  await import("./menu.css");
  const content = await fetchBlock("");
  kpm.innerHTML = content;

  const loginButton = kpm.getElementsByClassName("kpm-login")[0];

  if (loginButton) {
    const loginUrl = loginButton.getAttribute("href");

    loginButton.setAttribute(
      "href",
      `${loginUrl}?next=${window.encodeURIComponent(location.href)}`
    );
  }
}

async function fetchBlock(block) {
  try {
    const content = await window
      .fetch(`/kpm/blocks/${block}`)
      .then((r) => {
        if (r.status > 400) {
          throw new Error(`${r.status} ${r.statusText}`);
        }
        return r;
      })
      .then((r) => r.text());

    console.log(content);
    return content;
  } catch (err) {
    console.error(`Error when fetching the "${block}" block: `, err);
  }

  return "Content!!";
}

start();
