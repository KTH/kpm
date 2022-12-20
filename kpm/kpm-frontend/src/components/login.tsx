import * as React from "react";
import { useState, useEffect } from "react";
import { i18n } from "../i18n/i18n";
import {
  createApiUri,
  loginEventPubSub,
  TLoginEvents,
  TPubSubEvent,
} from "../panes/utils";
import { MenuPane } from "./menu";

import "./login.scss";

export function LoginModal({
  show = false,
  onDismiss,
}: {
  show: boolean;
  onDismiss: () => void;
}) {
  if (!show) {
    return null;
  }

  return (
    <MenuPane>
      <LoginWidget onDismiss={onDismiss} />
    </MenuPane>
  );
}

export function LoginWidget({ onDismiss }: { onDismiss: () => void }) {
  const loginUri = `${createApiUri("/auth/login")}?nextUrl=${location.href}`;
  return (
    <div className="kpm-login-widget">
      <a href={loginUri} className="kpm-button kpm-button-primary">
        {i18n("Login again")}
      </a>
      {i18n("or")}
      <button
        className="kpm-button kpm-button-link"
        onClick={(e) => onDismiss()}
      >
        {i18n("Dismiss")}
      </button>
    </div>
  );
}

export function useLogin(): [show: boolean, setShow: (val: boolean) => void] {
  const [show, setShow] = useState(false);

  const doLoginStateChange = (event: TPubSubEvent<TLoginEvents>) => {
    const { value } = event;
    setShow(!value);
  };

  // Continue polling until unmounted
  useEffect(() => {
    loginEventPubSub.subscribe(doLoginStateChange);
    return () => loginEventPubSub.unsubscribe(doLoginStateChange);
  }, []);

  return [show, setShow];
}
