import { TSessionUser } from "kpm-backend-interface";
import { useEffect, useState } from "react";
import { fetchApi } from "../panes/utils";
import { PubSub, TPubSubEvent } from "./PubSub";

const IS_DEV = process.env.NODE_ENV !== "production";

export const currentUser: TSessionUser | undefined =
  window.__kpmCurrentUser__ ||
  (IS_DEV && {
    kthid: "u19t0qf2",
    display_name: "Dr.LocalDev Server",
    email: "test@email.com",
    username: "jhsware",
    hasEduCourses: true,
    hasLadokCourses: true,
    numNewNotifications: 3,
    expires: 1668683814,
  }) ||
  undefined;

window.__kpmCurrentUser__ = undefined;

/**
 * Handle user state using event passing and expose it to
 * React components through hook.
 *
 * NOTE: This pattern can be used to store any global state
 * and expose it to React components.
 */
export type TAuthStateEvents = "CurrentUser";
export const authState = new PubSub<TAuthStateEvents>({
  name: "CurrentUser",
  value: currentUser,
});

export function useAuthState() {
  const [currentUser, setCurrentUser] = useState(
    authState.state("CurrentUser")
  );

  const callback = (event: TPubSubEvent<any>) => {
    if (event.name === "CurrentUser") {
      setCurrentUser(event.value);
    }
  };

  useEffect(() => {
    authState.subscribe(callback);
    return () => authState.unsubscribe(callback);
  }, []);

  return [currentUser as TSessionUser];
}

/**
 * Checks to clear user if session expires when page has been open for a long time
 */

// Check if session is still valid after page hidden
async function checkValidSession() {
  if (document.hidden) {
    // Do we want to do something on hidden?
    return;
  }

  const res = await fetchApi("/api/session");
  const json = await res.json();

  if (res.ok && json.user) {
    authState.send({ name: "CurrentUser", value: json.user });
    sendKpmLoaded(true);
    return;
  }

  authState.send({ name: "CurrentUser", value: undefined });
  sendKpmLoaded(false);
}

export function initSessionCheck() {
  document.addEventListener("visibilitychange", checkValidSession);
  setTimeout(checkValidSession); // Once on startup, without delaying first paint
  setInterval(checkValidSession, 10 * 1000); // Every 10 seconds for testing
}

// Check if session is valid for at least 30 mins every 15 mins
setInterval(() => {
  const user = authState.state("CurrentUser");
  const now = new Date().getTime();
  if (user.expires < now + 30 * 60 * 1000) {
    authState.send({
      name: "CurrentUser",
      value: undefined,
    });
  }
}, 15 * 60 * 1000);

function sendKpmLoaded(authorized: boolean) {
  // Only send this event when the page is visible
  // to avoid multiple pages getting stuck on the
  // login screen. Since checkValidSession() is
  // called on visibilitychange, this event will
  // be sent when the page is visible again.
  if (!document.hidden) {
    document.dispatchEvent(
      new CustomEvent("kpmLoaded", {
        detail: {
          authorized,
          lang: window.__kpmSettings__?.["lang"] || "en",
          desc: "This event is fired when KPM is loaded and has checked SSO authorisation.",
        },
      })
    );
  }
}
