import Cookies from "js-cookie";

const COOKIE_NAME = "use_kpm";

function getButton(id) {
  const btn = document.getElementById(id);
  if (btn) {
    return btn;
  }
  return false;
}

function onClick() {
  const cookie = Cookies.get(COOKIE_NAME);
  if (!cookie) {
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


async function logStatus(status) {
  try {
    const res = await fetch(`/kpm/cookie/${status ? "enabled" : "disabled"}`, {
      method: "POST",
    });
    if (res.ok) {
      const container = document.getElementById("toggle_menu_container");
      container.innerHTML = "";
      container.innerHTML = await res.text();
      // FIXME: is this really correct? Should we create an event in a logging function?
      createSetCookieEvent();
      return true;
    }
    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
}
export async function toggleMenu() {
  const cookie = !!Cookies.get(COOKIE_NAME);
  await logStatus(cookie);
  createSetCookieEvent();
}
