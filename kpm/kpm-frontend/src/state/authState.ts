import { useEffect, useState } from "react";
import { TCurrentUser } from "../app";
import { fetchApi } from "../panes/utils";
import { PubSub, TPubSubEvent } from "./PubSub";

const IS_DEV = process.env.NODE_ENV !== "production";

export const currentUser: TCurrentUser =
  window.__kpmCurrentUser__ ||
  (IS_DEV && {
    kthid: "u19t0qf2",
    display_name: "Dr.LocalDev Server",
    email: "test@email.com",
    username: "jhsware",
    exp: 1668683814,
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

  return [currentUser];
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
    return;
  }

  authState.send({ name: "CurrentUser", value: undefined });
}

document.addEventListener("visibilitychange", checkValidSession);

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
