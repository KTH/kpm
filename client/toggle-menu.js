import Cookies from "js-cookie";

const COOKIE_NAME = "use_kpm";

async function logStatus(status) {
  try {
    const res = await fetch(`/kpm/log/${status ? "enabled" : "disabled"}`);
    if (res.ok) {
      const container = document.getElementById("toggle_menu_container");
      container.innerHTML = "";
      container.innerHTML = await res.text();
      createSetCookieEvent();
      return true;
    }
    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
}

function getButton(id) {
  const btn = document.getElementById(id);
  if (btn) {
    return btn;
  }
  return false;
}

function onClick(e) {
  const cookie = Cookies.get(COOKIE_NAME);
  if (!cookie) {
    Cookies.set(COOKIE_NAME, "true");
    logStatus(true);
  } else {
    Cookies.remove(COOKIE_NAME);
    logStatus(false);
  }
}

function createSetCookieEvent() {
  try {
    const btn = getButton("toggle_kpm");
    if (btn) {
      btn.addEventListener("click", onClick);
    } else {
      throw new Error("Unable to find button");
    }
  } catch (err) {
    console.log(err);
  }
}

export async function toggleMenu() {
  const cookie = Cookies.get(COOKIE_NAME) ? true : false;
  await logStatus(cookie);
  createSetCookieEvent();
}
