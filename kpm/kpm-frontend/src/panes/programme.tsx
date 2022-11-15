import * as React from "react";
import { Todo } from "../components/placeholder";
import { i18n } from "../i18n/i18n";

export function Programme() {
  return <Todo title={i18n("Programme")} />;
}
